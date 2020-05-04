var express = require("express");
const debug = require("debug")("mytooltruck-api-routes-user");
const { validate, ValidationError, Joi } = require("express-validation");

const signupValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(/[a-zA-Z0-9]{3,30}/)
      .required(),
  }),
};

var router = express.Router();

router.get("/", function (req, res, next) {});
router.post(
  "/",
  validate(signupValidation, { keyByField: true }, {}),
  function (req, res, next) {}
);
router.put("/", function (req, res, next) {});
router.delete("/", function (req, res, next) {});

module.exports = router;
