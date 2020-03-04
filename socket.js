const debug = require("debug")("myapp-api:socket");

const authMiddleware = require("./middlewares/auth");
const publicEventHandler = require("./socket-events/public-events");
const authUserEventHandler = require("./socket-events/authuser-events");

const socketService = require("./services/socket-service");

socketService
  .resetConnectedSocketRegister()
  .then(info => {
    info && debug("ConnectedSocket collection is droped.");
  })
  .catch(ex => {
    debug(ex.message);
  });

const socketServer = io => {
  io.on("connection", socket => {
    debug("A user connected to default socket");

    publicEventHandler({ socket, namespace: "/" });
  });

  // Seperate namespace for events which require basic authentication
  const authuserNamespace = "/authuser";
  const authUserIO = io.of(authuserNamespace);
  authUserIO.use(authMiddleware.verifySocketUser);

  authUserIO.on("connection", socket => {
    debug("A user connected to authUserIO");

    authUserEventHandler({ socket, namespace: authuserNamespace });
  });
};

module.exports = socketServer;
