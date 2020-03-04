var debug = require("debug")("myapp-api:server");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

bbPromise = require("bluebird");

mongoose.Promise = bbPromise;

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

mongoose
  .connect(config.mongo.host + config.mongo.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(function() {
    debug("Connected to db");
  })
  .catch(function(err) {
    debug(err);
    throw err;
  });

var app = express();

app.use(logger(config.logger));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.set('view engine', 'ejs');

var routes = require("./routes/index");
app.use("/api", routes);

module.exports = app;
