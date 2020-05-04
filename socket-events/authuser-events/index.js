const debug = require("debug")("myapp-api-socket");

const socketService = require("../../services/socket-service");

const authUserEventHandler = ({ socket, namespace }) => {
  socketService
    .registerSocket(socket, namespace)
    .then(() => {})
    .catch((ex) => {
      debug(ex.message);
    });

  socket.on("disconnect", (info) => {
    debug("A user disconnected from authuserIO");

    socketService
      .deRegisterSocket(socket)
      .then(() => {})
      .catch((ex) => {
        debug(ex.message);
      });
  });
};

module.exports = authUserEventHandler;
