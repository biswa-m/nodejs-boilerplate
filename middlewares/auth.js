var jwt = require("jsonwebtoken");
var debug = require("debug")("myapp-api:auth");

var authMiddleware = {
  verifyUser: function(req, res, next) {
    var authorization = req.get("Authorization");
    if (authorization) {
      var token = authorization.match(/Bearer\s(\S+)/);
      if (token && token[1]) {
        try {
          var tokenInfo = jwt.verify(token[1], config.jwt.secret);
          req.user = {
            userId: tokenInfo.userId,
            _id: tokenInfo.userId
          };
          next();
        } catch (ex) {
          debug("Error in authMiddleware.verifyToken: %s", ex.message);
          res.status(401).json({ error: "Unauthorized access" });
        }
      } else {
        res.status(401).json({ error: "Bearer token needed" });
      }
    } else {
      res.status(401).json({ error: "Authorization needed" });
    }
  },

  verifySocketUser: function(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        config.jwt.secret,
        (err, decoded) => {
          if (err) {
            debug("error decoding jwt: %s", err);
            return next(new Error("Authentication error"));
          }
          socket.user = decoded;
          next();
        }
      );
    } else {
      debug("AuthMiddleware.verifySocketUser: Error: Missing token");
      next(new Error("Authentication error"));
    }
  }
};

module.exports = authMiddleware;
