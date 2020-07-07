const httpStatus = require("http-status");
const uuidv4 = require("uuid/v4");
const { DateTime } = require("luxon");

const User = require("../models/user");
const Session = require("../models/session");

const { Error } = require("../utils/api-response");
const { generateRandom } = require("../utils/methods");

exports.register = async (payload) => {
  const { fullName, gamerName, phone, email, password, tosAgreement } = payload;

  if (!tosAgreement) {
    throw new Error({
      message: "You need to accept the terms and conditions",
      status: httpStatus.BAD_REQUEST,
    });
  }

  const isEmailExists = await User.findOne({ email });

  if (isEmailExists) {
    throw new Error({
      message: "Email address is already exists.",
      status: httpStatus.CONFLICT,
    });
  }
  const token = generateRandom(6, false);

  let user = await new User({
    email,
    phone,
    fullName,
    gamerName,
    password,
    tosAgreement,
    "verifyTokens.email": token,
  }).save();

  return user;
};

exports.emailVerification = async (email, token) => {
  if (!token) {
    throw new Error({
      message: "Invalid code",
      status: httpStatus.BAD_REQUEST,
    });
  }

  const query = { "verifyTokens.email": token, email: email.toLowerCase() };
  const update = {
    $addToSet: { verifications: "email" },
    "verifyTokens.email": "",
  };

  let user = await User.findOneAndUpdate(query, update);

  if (!user) {
    throw new Error({
      message: "Incorrect code",
      status: httpStatus.CONFLICT,
    });
  }
  return user;
};

exports.login = async (payload) => {
  const { email, password, clientType, deviceToken } = payload;
  const user = await User.findOne({ email });
  const passwordMatches = user && (await user.passwordMatches(password));

  if (!user || !passwordMatches) {
    throw new Error({
      message: "Credentials did not match",
      status: httpStatus.CONFLICT,
    });
  }

  if (!user.verifications || user.verifications.indexOf("email") == -1) {
    throw new Error({
      message:
        "Your email address is not verified. Please verify your email to continue.",
      status: httpStatus.NOT_ACCEPTABLE,
    });
  }

  if (user.status === "blocked") {
    throw new Error({
      message: "Your account has been suspended by admin.",
      status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
    });
  }

  if (user.status === "deactivated") {
    throw new Error({
      message: "You have deactivated your account.",
      status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
    });
  }

  const token = await generateTokenResponse(user, {
    clientType: clientType,
    deviceToken: deviceToken,
  });

  return { token, user };
};

exports.getPasswordResetToken = async (email) => {
  const query = { email };

  const user = await User.findOne(query);

  if (!user) {
    throw new Error({
      message: "Please enter your registered email address.",
      status: httpStatus.BAD_REQUEST,
    });
  }
  const token = generateRandom();
  const updatedUser = await User.findOneAndUpdate(query, {
    "verifyTokens.resetPassword": token,
  });

  return { token, user };
};

exports.resetPassword = async (payload) => {
  const { password, token } = payload;
  if (!token) {
    throw new Error({
      message: "Invalid code",
      status: httpStatus.BAD_REQUEST,
    });
  }

  const query = { "verifyTokens.resetPassword": token };
  const user = await User.findOne(query);

  if (!user) {
    throw new Error({
      message: "Not an authorized user",
      status: httpStatus.UNAUTHORIZED,
    });
  }

  const isPasswordMatches = await user.passwordMatches(password);

  if (isPasswordMatches) {
    throw new Error({
      message: "New password can not same as old password",
      status: httpStatus.CONFLICT,
    });
  }

  const hash = await user.hashPassword(password);

  await User.findOneAndUpdate(query, {
    password: hash,
    "verifyTokens.resetPassword": "",
  });
};

exports.logout = async ({ refreshToken }) => {
  const session = await Session.findOne({
    refreshToken: refreshToken,
  });

  if (!session) {
    throw new Error({
      message: "Refresh token did not match",
      status: httpStatus.CONFLICT,
    });
  }

  await Session.deleteOne({
    _id: session._id,
  });

  return true;
};

exports.updateFcm = ({ refreshToken, token }) => {
  return Session.findOneAndUpdate(
    { refreshToken: refreshToken },
    { notificationToken: token },
    { new: true }
  );
};

exports.getUser = async ({
  query,
  select,
  public = false,
  limit = 0,
  skip = 0,
}) => {
  if (public) {
    select = select ? select : "fullName photo role";
  }

  return User.find(query, select).limit(limit).skip(skip).exec();
};

exports.getSocketIds = async ({ users }) => {
  return Session.find({ _id: { $in: users } })
    .lean()
    .then((sessions) => {
      let socketIds = [];
      sessions.map((x) => x && x.socketIds);

      return socketIds;
    });
};

/**
 * @async
 * Returns a formated object with tokens
 * @param {object} user object
 * @param {string} accessToken token
 * @param {string} refreshObjectId _id of refreshToken if planning to update previous one
 * @returns {object} access token object
 * @private
 */

async function generateTokenResponse(user, deviceInfo) {
  const refreshToken = uuidv4() + user._id;
  const token = user.token();

  const session = await Session.findOneAndUpdate(
    { deviceToken: deviceInfo.deviceToken },
    {
      ...deviceInfo,
      accessToken: token,
      issuedAt: DateTime.local(),
      isActive: true,
      refreshToken: refreshToken,
    },
    { upsert: true }
  );

  const expiresIn = DateTime.local()
    .plus({ minutes: config.jwtExpirationInterval })
    .toSeconds();

  return {
    accessToken: token,
    expiresIn,
    refreshToken,
  };
}
