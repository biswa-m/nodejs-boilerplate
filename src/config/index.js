require("dotenv").config();

/** Default config will remain same in all environments and can be over-ridded */
let config = {
  allowedMedia: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "avi",
    "mov",
    "3gp",
    "mp4",
    "mkv",
    "mpeg",
    "mpg",
    "mp3",
    "pdf",
  ],
  baseUrl: "http://localhost:3001",
  ddosConfig: {
    burst: 100,
    limit: 100,
  },
  emails: {
    "api-key":
      "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",
    from: {
      email: "info@express.com",
      name: "Express Boilerplate Platform",
    },
    templates: {
      "invite-email": "",
      "reset-password": "",
      verification: "",
    },
  },
  env: process.env.NODE_ENV,
  fcm: { "server-key": "" },
  // JWT expiry time in minutes
  jwtExpirationInterval: 60 * 12,
  jwtSecret: "LJSDLFowuro3lesjf*&*&skfljw4r034ofjlsflskfj",
  mediaTypes: ["photo", "video", "document"],
  mongo: { host: "mongodb://localhost:27017/", database: "express" },
  port: 3001,
  roles: ["admin", "user"],
  socketPort: 3002,
  socketUrl: "localhost",
  twilioConfig: {
    // Your Account SID from www.twilio.com/console
    accountSid: "",
    authToken: "",
    from: "",
  },
  website: "http://localhost:3000",
  whitelist: null,
  logger: "dev",
};

if (process.env.NODE_ENV === "staging") {
  config = {
    ...config,
    mongo: { host: "mongodb://localhost:27017/", database: "express-stage" },
    whitelist: [],
    logger: "combined",
  };
} else if (process.env.NODE_ENV === "production") {
  config = {
    ...config,
    mongo: { host: "mongodb://localhost:27017/", database: "express" },
    whitelist: [],
    logger: "combined",
  };
}

module.exports = config;
