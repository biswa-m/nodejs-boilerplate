var debug = require("debug")("myapp-api:server");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

bbPromise = require("bluebird");

//Setup configuration based on environment
env = process.env.NODE_ENV || "development";
debug("Environment: " + env);
switch (env) {
  case "development":
    config = require("./config").development;
    debugModeOn = true;
    break;
  case "stagging":
    config = require("./config").stagging;
    debugModeOn = true;
    break;
  case "production":
    config = require("./config").production;
    debugModeOn = false;
    break;
}

mongoose.Promise = bbPromise;
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose
  .connect(config.mongo.host + config.mongo.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(function () {
    debug("Connected to db");
  })
  .catch(function (err) {
    debug(err);
    throw err;
  });

var routes = require("./routes/index");

var app = express();
app.set("view engine", "ejs");

app.use(logger(config.logger));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use("/api", routes);
app.use("/static", express.static(path.join(__dirname, "public")));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not found");
  err.statusCode = 404;
  next(err);
});

// Error handlers
switch (env) {
  case "development":
  case "stagging":
    app.use(function (err, req, res, next) {
      console.log(err.stack);

      res.status(err.statusCode || 500);
      res.json({
        error: {
          message: err.message,
          error: err,
        },
      });
    });
    break;

  case "production":
  default:
    app.use(function (err, req, res, next) {
      res.status(err.statusCode || 500);
      res.json({
        error: {
          message: err.message,
          error: {},
        },
      });
    });
    break;
}

module.exports = app;
