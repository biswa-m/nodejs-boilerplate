const debug = require("debug")("myapp-api-socket");
const authMiddleware = require("../middlewares/auth");
const publicEventHandler = require("../socket-events/public-events");
const authUserEventHandler = require("../socket-events/authuser-events");

const ConnectedSocket = require("../models/connected-socket");

let socketService = {};

socketService.init = async () => {
  await socketService
    .resetConnectedSocketRegister()
    .then((info) => {
      info && debug("ConnectedSocket collection is droped.");
    })
    .catch((ex) => {
      debug(ex.message);
    });

  global.io.on("connection", async (socket) => {
    debug("A user connected to default socket");
    publicEventHandler({ socket, namespace: "/" });
  });

  // Seperate namespace for events which require authentication
  const authuserNamespace = "/authuser";
  const authUserIO = global.io.of(authuserNamespace);
  authUserIO.use(authMiddleware.verifySocketUser);

  authUserIO.on("connection", (socket) => {
    debug("A user connected to authUserIO");
    authUserEventHandler({ socket, namespace: authuserNamespace });
  });
};

socketService.emitToSocketId = (socketId, eventName, data) => {
  debug(`Emit ${eventName}`, socketId, data);
  global.io.to(`${socketId}`).emit(eventName, data);
};

socketService.emitOverChannel = (eventName, data) => {
  debug(`Emit over channel ${eventName}`, data);
  global.io.emit(eventName, data);
};

socketService.broadcastMessage = async ({
  recipients,
  message,
  socket,
  eventString,
}) => {
  if (!recipients || !recipients.length || !message || !socket) {
    throw new Error("Error broadcasting message: missing valid required data");
  }

  return ConnectedSocket.find({
    user: { $in: recipients },
  })
    .lean()
    .then((results) => {
      return results.map((x) => x.socketId);
    })
    .then((socketIds) => {
      if (!socketIds.length) return null;

      // debug("Broadcasting message: ", socketIds, eventString || "/chat/post");

      let pipe = socket.broadcast;

      if (!socketIds.length || !socketIds[0]) return;

      for (let i = 0; i < socketIds.length; ++i) {
        let socketId = socketIds[i];
        if (!socketId) continue;
        pipe = pipe.to(socketId);
      }

      pipe = pipe.to(socketIds[0]);

      pipe.emit(eventString || "/chat/post", message);

      return socketIds;
    })
    .catch((ex) => {
      debug("Error in SocketService.broadcastMessage: ", ex.message);
      throw ex;
    });
};

socketService.broadcastToAll = async ({ message, socket, eventString }) => {
  if (!message || !socket) {
    throw new Error("Error broadcasting message: missing valid required data");
  }

  socket.broadcast.emit(eventString || "/broadcast/all", message);
  return true;
};

socketService.get = (query) => {
  return ConnectedSocket.find(query).lean();
};

socketService.resetConnectedSocketRegister = () => {
  return ConnectedSocket.collection.drop();
};

socketService.registerSocket = (socket, namespace) => {
  return ConnectedSocket.create({
    socketId: socket.id,
    user: socket.user && socket.user.userId,
    namespace,
  });
};

socketService.deRegisterSocket = (socket) => {
  return ConnectedSocket.deleteOne({ socketId: socket.id });
};

module.exports = socketService;
