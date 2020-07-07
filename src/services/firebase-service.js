const debug = require("debug")("patch-api:firebase");
var admin = require("firebase-admin");
var serviceAccount = require("../config/firebase-admin-key.json");
const User = require("../models/user");
const Session = require("../models/session");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.cloudMessaging = ({ tokens, data, options = {}, notification }) => {
  // Create a list containing up to 500 registration tokens.
  // These registration tokens come from the client FCM SDKs.

  // tokens = [
  //   "fMCVdpQvFak:APA91bH5MhScKtONON0wI2FMHzk0-jC9Fgr1qDZdg94_uk7_xj6sk9vfbOPkL59AQWJ1EAfjegmSWU02nU4NegYGRsmNQqpZP6tmqz2veWA9L53LlB9dKBxYb95z8Y0zRu3HVVIeAWu2"
  // ];

  const payload = {
    data: data,
  };

  var options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
    ...options,
  };

  if (notification) payload.notification = notification;

  if (!tokens || !tokens.length || !data) {
    throw new Error("Missing required data");
  }

  return admin
    .messaging()
    .sendToDevice(tokens, payload, options)
    .then((response) => {
      console.log({ response: JSON.stringify(response) });
      console.log(
        response.successCount +
          " messages were sent successfully from " +
          tokens.length +
          "tokens"
      );

      return response;
    })
    .catch((ex) => {
      console.log("Error sending pushNotification: ", ex);
      return null;
    });
};

exports.sendNotification = async ({ title, message, receipients }) => {
  receipients = receipients.map((x) => x._id || x);

  let sessions = await Session.find({ user: { $in: receipients } });

  let tokens = sessions
    .filter((x) => x && x.notificationToken)
    .map((x) => x.notificationToken);

  let tokenGrps = [[]];

  let grpCount = 0;
  let grpMemCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    tokenGrps[grpCount].push(token);

    ++grpMemCount;
    if (grpMemCount >= 20) {
      ++grpCount;
      tokenGrps[grpCount] = [];
      grpMemCount = 0;
    }
  }

  tokenGrps.forEach(async (tokens) => {
    if (!tokens || !tokens.length) return;

    let data = {};
    let notification = {
      title,
      message: message,
      body: message,
    };

    return this.cloudMessaging({
      tokens,
      data,
      notification,
    }).then((response) => this.handleFCMResponse({ response, tokens }));
  });
};

exports.handleFCMResponse = ({ response, tokens }) => {
  debug({ response, tokens });
  if (!response || !response.results || !response.results.length) {
    return null;
  }

  response.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      // Cleanup the tokens who are not registered anymore.
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        this.removeSession({ token: tokens[index] }).catch(debug);
      }
    }
  });
};

exports.removeSession = async ({ token }) => {
  const info = await Session.deleteOne({
    notificationToken: token,
  });

  return info;
};
