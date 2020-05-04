var express = require("express");
const debug = require("debug")("myapp-api-routes-user");
const { validate, Joi } = require("express-validation");
const { Error } = require("../../utils/api-response");

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
  function (req, res, next) {
    // let ex = new Error({message: "this is wrong", "status": 402});

    next(ex);
  }
);
router.put("/", function (req, res, next) {});
router.delete("/", function (req, res, next) {});

module.exports = router;
