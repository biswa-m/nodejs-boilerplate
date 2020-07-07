const express = require("express");
const validate = require("express-validation");
const controller = require("./controller");
const {
  register,
  login,
  verificationToken,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  addPeople,
  userAvailable,
  users,
  blockUnblock,
  editProfile,
  changeRole,
  search,
} = require("./validation");
const { authorize } = require("../../../middlewares/auth");

const routes = express.Router();

/**
 * @api {post} v1/user/register Register user
 * @apiDescription Register a user account
 * @apiVersion 1.0.0
 * @apiName registerUser
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  firstName   First name
 * @apiParam  {String}  lastName    Last name
 * @apiParam  {String}  email       Email
 * @apiParam  {String}  password    Password
 *
 * @apiSuccess {Object}  token     Access Token's object {accessToken: String, refreshToken: String, expiresIn: Number}
 * @apiSuccess {Object}  user      User detail object {_id:String, firstName:String, lastName:String, email: String }
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Conflict 409)     ValidationError  Email address is already exists
 */

routes.route("/register").post(validate(register), controller.register);

/**
 * @api {get} v1/user/email-verification Email Verification
 * @apiDescription User's Email verification
 * @apiVersion 1.0.0
 * @apiName emailVerification
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  token  Email Verification token
 * @apiError (Conflict 409)  ValidationError  Token expires
 * @apiSuccess (No Content 204) No Content Redirected to landing page.
 */

routes
  .route("/email-verification/:token")
  .get(validate(verificationToken), controller.emailVerification);

/**
 * @api {post} v1/user/login Login user
 * @apiDescription Login a account
 * @apiVersion 1.0.0
 * @apiName loginUser
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  email       Email
 * @apiParam  {String}  password    Password
 * @apiParam  {String=ios,android,browser}  clientType  Client Type
 * @apiParam  {String}  [deviceToken] Device Token
 *
 * @apiSuccess {Object}  token     Access Token's object {accessToken: String, refreshToken: String, expiresIn: Number}
 * @apiSuccess {Object}  user      User detail object {_id:String, firstName:String, lastName:String, email: String }
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Conflict 409)     ValidationError  Credentials did not match
 */

routes.route("/login").post(validate(login), controller.login);

/**
 * @api {POST} v1/user/forgot-password Forgot Password
 * @apiDescription Request reset password
 * @apiVersion 1.0.0
 * @apiName Forgot Password
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  email  Registered email
 * @apiError (Conflict 409)  ValidationError  Email not found
 * @apiSuccess (No Content 204) No Content  Redirected to landing page.
 */

routes
  .route("/forgot-password")
  .post(validate(forgotPassword), controller.forgotPassword);

/**
 * @api {PUT} v1/user/reset-password Reset Password
 * @apiDescription User can reset password
 * @apiVersion 1.0.0
 * @apiName Reset Password
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String} token     Access token
 * @apiParam  {String} password  New password for account
 * @apiError (Conflict 409)  ValidationError  Old password and New Password are same.
 * @apiSuccess (No Content 204) No Content
 */

routes
  .route("/reset-password")
  .post(validate(resetPassword), controller.resetPassword);

/**
 * @api {put} v1/user/logout Logout user
 * @apiDescription Logout from a account
 * @apiVersion 1.0.0
 * @apiName logoutUser
 * @apiGroup User
 * @apiPermission private
 *
 * @apiParam  {String}  refreshToken  Refresh token
 * @apiHeader {String} Authorization Authorization token
 * @apiSuccess (No Content 204)   User logged out successfully
 * @apiError (Conflict 409)  ValidationError  Refresh token did not match
 */

routes
  .route("/logout")
  .put(validate(refreshToken), authorize(), controller.logout);

/**
 * @api {put} v1/user/fcm update fcm token
 * @apiDescription Update fcm token
 * @apiVersion 1.0.0
 * @apiName updateFcmToken
 * @apiGroup User
 * @apiPermission private
 *
 * @apiParam  {String}  token  fcm token
 * @apiHeader {String}  platform
 * @apiSuccess (No Content 204) No Content
 * @apiError (Conflict 409)  ValidationError  Refresh token did not match
 */

routes.route("/fcm").put(authorize(), controller.updateFcm);

/**
 * @api {get} v1/user/search Search User
 * @apiDescription Search user
 * @apiVersion 1.0.0
 * @apiName searchUser
 * @apiGroup User
 * @apiPermission user
 *
 * @apiParam  {String}  fullName
 * @apiParam  {String}  gamerName
 * @apiParam  {String}  email
 * @apiParam  {String}  phone
 * @apiParam  {Number}  limit Limit result
 * @apiParam  {Number}  skip  Skip result for pagination
 * @apiParam  {String}  q   Match fullName, gamerName, email of Phone containing this string
 *
 * @apiError (Conflict 409)  ValidationError  Token expires
 * @apiSuccess {Array} users Array of user object
 */

routes.route("/search").get(validate(search), authorize(), controller.search);

/**
 * @api {get} v1/user/:_id Get user
 * @apiDescription Get user details
 * @apiVersion 1.0.0
 * @apiName getUser
 * @apiGroup User
 * @apiPermission user
 *
 * @apiParam  {Number}  _id  user id
 *
 * @apiError (Conflict 409)  ValidationError  Token expires
 * @apiSuccess {Object} user User Object
 */

routes.route("/:_id").get(authorize(), controller.getUser);

module.exports = routes;
