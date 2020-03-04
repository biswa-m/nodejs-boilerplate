module.exports = {
  development: {
    appname: "myapp-api",
    version: "0.5",
    logger: "dev",
    mongo: {
      host: "mongodb://localhost/",
      database: "myappDB"
    },
    jwt: {
      issuer: "localhost",
      audience: "http://locahost",
      secret: "devSecretSymboDiff",
      adminSecret: "devAdminSecretSymboDiff"
    },
    base_url: "http://localhost:3001"
  },
  stagging: {
    appname: "myapp-api",
    version: "0.5",
    logger: "dev",
    mongo: {
      host: "mongodb://localhost/",
      database: "myappDB"
    },
    jwt: {
      issuer: "localhost",
      audience: "http://locahost",
      secret: "someVeryRandomString(*#RUOJF:SKHF",
      adminSecret: "someVeryRandomString#OFLDKN"
    },
    base_url: "http://localhost:3001"
  },
  production: {
    appname: "myapp-api",
    version: "0.5",
    logger: "combined",
    mongo: {
      host: "mongodb://localhost/",
      database: "myappDB"
    },
    jwt: {
      issuer: "localhost",
      audience: "http://locahost",
      secret: "someVeryRandomString(*#RUOJF:SKHF",
      adminSecret: "someVeryRandomString#OFLDKN"
    },
    base_url: "http://localhost:3001"
  }
};
