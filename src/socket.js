const httpStatus = require("http-status");
const User = require("./models/user");
const { Error } = require("./utils/api-response");

const authentication = async (data, socketId) => {
  try {
    let user = await User.findOne({ "sessions.refreshToken": data.token });

    if (user) {
      user = await User.findOneAndUpdate(
        { "sessions.refreshToken": data.token },
        { $set: { "sessions.$.socketId": socketId } },
        { new: true }
      );
    }

    return user;
  } catch (err) {
    throw new Error({
      message: "Unauthorized",
      status: httpStatus.UNAUTHORIZED,
    });
  }
};

exports.emitToSocketIds = async (socketIds, eventName, data) => {
  debug(`Emit ${eventName}`, socketIds, data);

  if (!socketIds || !socketIds.length) {
    throw new Error({ message: "Error in emitToSocketIds, no socket id" });
  }
  if (!socketIds[0]) {
    throw new Error({ message: "Error in emitToSocketIds, invalid socketId" });
  }
  if (!eventName) {
    throw new Error({
      message: "Error in emitToSocketIds, no eventName provided",
    });
  }

  let pipe = global.io;

  for (let i = 0; i < socketIds.length; ++i) {
    let socketId = socketIds[i];
    if (!socketId) continue;
    pipe = pipe.to(socketId);
  }

  pipe.emit(eventName, data);
};

exports.emitToSocketId = (socketId, eventName, data) => {
  debug(`Emit ${eventName}`, socketId, data);
  global.io.to(`${socketId}`).emit(eventName, data);
};

exports.emitOverChannel = (eventName, data) => {
  debug(`Emit over channel ${eventName}`, data);
  global.io.emit(eventName, data);
};

exports.init = async () => {
  debug("Initializing socket");

  global.io.on("connection", async (socket) => {
    const query = socket.request._query;

    authentication(query, socket.id)
      .then((result) => {
        if (result) {
          global.io.to(socket.id).emit("onAuthenticated", true);

          debug(
            "One device is connected to socket: ",
            result._id,
            result.email
          );
          return;
        }

        global.io.to(socket.id).emit("onAuthenticated", false);
        global.io.sockets.sockets[socket.id].disconnect();
      })
      .catch(() => {});
  });
};
