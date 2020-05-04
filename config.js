var config = {
  appname: "myapp-api",
  version: "0.5",
  env: process.env.NODE_ENV || "development",
  logger: "dev",
  mongo: {
    host: "mongodb://localhost/",
    database: "myapp-dev",
  },
  jwt: {
    exp: 1000 * 60 * 15,
    secret: "SLDkfj43oi39509FSJL:j459uq908)#*@%)*",
    adminSecret: "dksf(#$)Q(*lksdjflSLKJLSKFJLSKFJ#5w(#W%&",
  },
  socket: {
    url: "localhost",
    port: process.env.SOCKET_PORT || 3002,
  },
  baseUrl: "http://localhost:3001",
  port: process.env.PORT || 3001,
};

switch (config.env) {
  case "production":
    config = {
      ...config,
      logger: "combined",
      mongo: {
        ...config.mongo,
        database: "myapp",
      },
      socket: {
        ...config.socket,
        url: "localhost",
        port: process.env.SOCKET_PORT || 5002,
      },
      baseUrl: "http://localhost:3001",
      port: process.env.PORT || 5001,
    };
    break;

  case "stagging":
    config = {
      ...config,
      logger: "combined",
      mongo: {
        ...config.mongo,
        database: "myapp",
      },
      socket: {
        ...config.socket,
        url: "localhost",
        port: process.env.SOCKET_PORT || 4002,
      },
      baseUrl: "http://localhost:3001",
      port: process.env.PORT || 4001,
    };
    break;

  case "development":
  default:
    break;
}

module.exports = config;
