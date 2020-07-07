/* eslint-disable max-lines */
const httpStatus = require("http-status");
const mongoose = require("mongoose");

const userServices = require("../../../services/user-services");
const mailServices = require("../../../services/mail-services");

const { capitalizeEachLetter } = require("../../../utils/methods");
const { Error } = require("../../../utils/api-response.js");

/**
 * Creates a new user if valid details
 * @public
 */

exports.register = (req, res, next) => {
  return userServices
    .register(req.body)
    .then((user) => {
      res.status(httpStatus.CREATED).json();

      const msg = {
        dynamic_template_data: {
          name: capitalizeEachLetter(`${user.fullName}`),
          code: `${user.verifyTokens.email}`,
        },
        templateId: "emailVerification",
        to: user.email,
      };

      mailServices.sendMail(msg).catch(debug);
    })
    .catch((e) => next(e));
};

/**
 * Email Verification
 * @private
 */
exports.emailVerification = (req, res, next) => {
  try {
    const {
      params: { token },
      query: { email },
    } = req;

    return userServices
      .emailVerification(email, token)
      .then(() => {
        return res.status(httpStatus.OK).json();
      })
      .catch((error) => {
        return next(error);
      });
  } catch (error) {
    return next(error);
  }
};

/**
 * Login with an existing user
 * @public
 */
exports.login = (req, res, next) => {
  return userServices
    .login(req.body)
    .then(({ user, token }) => {
      res.set("authorization", token.accessToken);
      res.set("x-refresh-token", token.refreshToken);
      res.set("x-token-expiry-time", token.expiresIn);
      res.status(httpStatus.OK);

      return res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        gamerName: user.gamerName,
        activeGame: user.activeGame,
        activeSession: user.activeSession,
        phone: user.phone || null,
        photo: user.photo || null,
        role: user.role,
      });
    })
    .catch((error) => next(error));
};

/**
 * Forgot Password
 * @public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const {
      body: { email },
    } = req;

    const { token, user } = await userServices
      .getPasswordResetToken(email)
      .catch((error) => next(error));

    const msg = {
      dynamic_template_data: {
        name: capitalizeEachLetter(`${user.fullName}`),
        url: `${config.website}/reset-password/${token}`,
      },
      templateId: "resetPassword",
      to: email,
    };

    mailServices.sendMail(msg).catch(debug);

    res.status(httpStatus.NO_CONTENT).json();

    return true;
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset Password
 * @public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const {
      body: { password, token },
    } = req;

    return userServices
      .resetPassword({ password, token })
      .then(() => {
        return res.status(httpStatus.NO_CONTENT).json();
      })
      .catch(next);
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    return userServices
      .logout({ refreshToken })
      .then(() => res.status(httpStatus.NO_CONTENT).json())
      .catch(next);
  } catch (error) {
    return next(error);
  }
};

exports.updateFcm = async (req, res, next) => {
  try {
    const {
      headers: { ["x-refresh-token"]: refreshToken },
      body: { token },
    } = req;

    debug({ refreshToken, token });

    return userServices.updateFcm({ refreshToken, token }).then(() => {
      return res.status(httpStatus.CREATED).json();
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Search user
 * @private
 */
exports.search = async (req, res, next) => {
  try {
    const {
      user: { _id },
      query: { fullName, gamerName, email, phone, q, limit, skip },
    } = req;

    let query = {};

    if (_id) {
      query["_id"] = { $ne: _id };
    }
    if (fullName) {
      query["fullName"] = fullName;
    }
    if (gamerName) {
      query["gamerName"] = gamerName;
    }
    if (email) {
      query["email"] = email;
    }
    if (phone) {
      query["phone"] = phone;
    }

    let query1 = {};
    if (q) {
      let regx = { $regex: new RegExp(`${q}`), $options: "i" };
      query1 = {
        $or: [
          { fullName: regx },
          { email: regx },
          { phone: regx },
          { gamerName: regx },
        ],
      };
    }

    query = { $and: [query, query1] };

    return userServices
      .getUser({ query, public: true, limit, skip })
      .then((users) => {
        return res.json({ users });
      });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user details
 * @private
 */
exports.getUser = async (req, res, next) => {
  try {
    const {
      params: { _id },
    } = req;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error({
        message: "Invalid user id",
        status: httpStatus.BAD_REQUEST,
      });
    }

    return userServices
      .getUser({ query: { _id }, public: true, limit: 1, skip: 0 })
      .then(async (users) => {
        let user = users[0];
        user = user.toObject();
        if (!user) {
          return res.json({ user });
        }

        return res.json({ user: { ...user } });
      })
      .catch(next);
  } catch (error) {
    return next(error);
  }
};
