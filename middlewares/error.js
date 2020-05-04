const httpStatus = require("http-status");
const expressValidation = require("express-validation");
const { Error } = require("../utils/api-response");

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
// eslint-disable-next-line no-unused-vars
const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    errors: err.errors,
    message: err.message || httpStatus[err.status],
    stack: err.stack,
  };

  if (config.env !== "development") {
    delete response.stack;
  }
  if (err.status) {
    res.status(err.status);
  } else {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
    console.log(err);
  }
  res.json(response);
};

exports.handler = handler;

/**
 * If error is not an instanceOf {Error}, convert it.
 * @public
 */
// eslint-disable-next-line no-unused-vars
exports.converter = (err, req, res, next) => {
  let convertedError = err;

  if (err instanceof expressValidation.ValidationError) {
    let elements =
      err.details &&
      err.details.map((x) => {
        return Object.keys(x)[0];
      });

    let customMsg = elements.join(", ");
    convertedError = new Error({
      errors: err.details,
      message: `Please enter valid ${customMsg}`,
      stack: err.stack,
      status: err.statusCode,
    });
  } else if (!(err instanceof Error)) {
    convertedError = new Error({
      message: err.message,
      stack: err.stack,
      status: err.status,
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res) => {
  const err = new Error({
    message: "Not found",
    status: httpStatus.NOT_FOUND,
  });

  return handler(err, req, res);
};
