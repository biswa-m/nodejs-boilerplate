const httpStatus = require("http-status");
const jwt = require("jwt-simple");
const { DateTime } = require("luxon");
const User = require("../models/user");
const { Error } = require("../utils/api-response");
const { jwtSecret } = require("../config");

const authorize = async (req, res, next, role, alwaysAllow = false) => {
  try {
    const { authorization } = req.headers;

    const apiError = alwaysAllow
      ? null
      : new Error({
          message: "Unauthorized",
          status: httpStatus.UNAUTHORIZED,
        });

    if (!authorization) {
      return next(apiError);
    }

    const token = authorization.split(" ")[1];

    try {
      const tokenResult = jwt.decode(token, jwtSecret);

      if (!tokenResult || !tokenResult.exp || !tokenResult._id) {
        apiError.message = "Malformed Token";

        await User.findOneAndUpdate(
          { "sessions.accessToken": token },
          { $pull: { sessions: { accessToken: token } } }
        );

        return next(apiError);
      }

      if (tokenResult.exp - DateTime.local().toSeconds() < 0) {
        apiError.message = "Token Expired";

        await User.findOneAndUpdate(
          { "sessions.accessToken": token },
          { $pull: { sessions: { accessToken: token } } }
        );

        return next(apiError);
      }

      const user = await User.findById(tokenResult._id).lean();

      if (!user) {
        return next(apiError);
      }

      if (user.status === "blocked") {
        throw new Error({
          message:
            "Your account has been suspended by admin. Please contact us for more information.",
          status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
        });
      }

      if (user.status === "deleted") {
        throw new Error({
          message:
            "You have deleted you account. Please signup again to continue",
          status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
        });
      }

      if (role && user.role !== role) {
        return next(apiError);
      }

      req.user = user;

      return next();
    } catch (e) {
      apiError && (apiError.message = "Token Expired");

      return next(apiError);
    }
  } catch (e) {
    return next(
      new Error({
        message: httpStatus[500],
        status: httpStatus.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

exports.authorize = (role, alwaysAllow = false) => (req, res, next) =>
  authorize(req, res, next, role, alwaysAllow);
