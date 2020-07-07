const express = require("express");
const path = require("path");

const router = express.Router();

/**
 * GET /
 */
router.get("/", function (req, res, next) {
  res.status(200).json({
    AppName: config.appName,
    Environment: config.env,
  });
});

/**
 * @api {get} /reset-password/:token password reset page
 * @apiDescription Get reset password html page
 * @apiVersion 1.0.0
 * @apiName website
 * @apiGroup Website
 * @apiPermission public
 *
 * @apiParam  {String}  token password reset token
 * @apiSuccess (Ok 200) html html page
 *
 */

router.get("/reset-password/:token", function (req, res, next) {
  res.sendFile(path.join(__dirname, "./reset-password.html"));
});

module.exports = router;
