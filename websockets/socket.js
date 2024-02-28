let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server);
    return io;
  },
  getIo: () => {
    if (!io) {
      throw "Socket connection not initialized!";
    }
    return io;
  },
};
