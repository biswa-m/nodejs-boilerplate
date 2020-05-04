var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.status(200).json({
    AppName: config.appName,
    Version: config.version,
    Environment: env,
  });
});

router.use("/user", require("./user"));

module.exports = router;
