const express = require("express");
const validate = require("express-validation");
const controller = require("./controller");
const { deleteFile, download } = require("./validation");
const { authorize } = require("../../../middlewares/auth");

const routes = express.Router();

/**
 * @api {post} v1/files/ Upload file
 * @apiDescription Upload file
 * @apiVersion 1.0.0
 * @apiName uploadFile
 * @apiGroup File
 * @apiPermission user
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiParam  {file}                          file           file
 * @apiParam  {String=photo, video, document} fileType       type of image
 * @apiParam  {Any} public       If provided, it will store file on public dir else cdn dir
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
 */

routes.route("/").post(authorize(null, true), controller.create);

/**
 * @api {get} v1/files/:_id Download file
 * @apiDescription Download file
 * @apiVersion 1.0.0
 * @apiName getFile
 * @apiGroup File
 * @apiPermission public
 *
 * @apiParam  {number}                  width       desire width
 * @apiParam  {number}                  height      desire height
 * @apiParam  {string}                  accessToken user access token
 * @apiParam  {string}                  format      desire format

 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
 */
routes.route("/:_id").get(validate(download), controller.download);

module.exports = routes;
