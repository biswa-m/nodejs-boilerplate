const debug = require("debug")("myapp-api-socket");

const socketService = require("../../services/socket-service");

const publicEventHandler = ({ socket, namespace }) => {
  socketService.registerSocket(socket, namespace).catch((ex) => {
    debug(ex.message);
  });

  socket.on("disconnect", (info) => {
    debug("A user disconnected from default socket");
  });
};

module.exports = publicEventHandler;
