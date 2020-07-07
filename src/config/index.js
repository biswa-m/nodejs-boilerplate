require("dotenv").config();

const port = process.env.PORT;

/** Default config will remain same in all environments and can be over-ridded */
let config = {
  appName: "DoctorBuddy",
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
  ddosConfig: {
    burst: 500,
    limit: 500,
  },
  emails: {
    "api-key": "",
    from: {
      email: "noreply@doctorbuddy.com",
      name: "DoctorBuddy",
    },
    templates: {},
  },
  env: process.env.NODE_ENV || "development",
  fcm: { "server-key": "" },
  // JWT expiry time in minutes
  jwtExpirationInterval: 60 * 24 * 365,
  jwtSecret: "jlksU^%*khskdfk9KHLKH9w392KHSLKADF",
  enums: {
    roles: ["admin", "user"],
    mediaTypes: ["photo", "video", "document"],
  },
  mongo: { host: "mongodb://localhost:27017/", database: "doctorbuddy-test" },
  port: port || 3001,
  socketUrl: "localhost",
  twilioConfig: {
    accountSid: "",
    authToken: "",
    from: "",
  },
  baseUrl: "http://localhost:" + (port || 3001) + "/api",
  website: "http://localhost:" + (port || 3001),
  whitelist: null,
  logger: "dev",
};

if (process.env.NODE_ENV === "stagging") {
  config = {
    ...config,
    // port: port || 3009,
    // baseUrl: "http://appxolo.com:" + (port || 3009) + "/api",
    // website: "http://appxolo.com:" + (port || 3009),

    logger: "combined",
  };
} else if (process.env.NODE_ENV === "production") {
}

module.exports = config;
