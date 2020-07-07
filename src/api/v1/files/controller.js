const httpStatus = require("http-status");
const path = require("path");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const File = require("../../../models/file");
const { Error } = require("../../../utils/api-response");
const fileService = require("../../../services/file-services");

/**gi
 * Add new file
 *
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const {
      query: { fileType, public },
    } = req;

    const userData = req.user || {};

    const now = DateTime.local();
    const todayStr = now.year + now.month + now.day;
    const folder = `${userData._id || "anonymous"}/${todayStr}/`;

    debug({ fileType, body: req.body, query: req.query });
    if (public) {
      var cdnFolder = path.join(__dirname, `../../../../public/`);
    } else {
      var cdnFolder = path.join(__dirname, `../../../../cdn/`);
    }

    const folderPath = cdnFolder + folder;

    const mongoObjectId = mongoose.Types.ObjectId();
    const customFileName = mongoObjectId;

    return fileService
      .write(
        { req, folderPath, customFileName },

        ({ file_path, file_extension, file_mime_type, file_original_name }) => {
          const saveFile = new File({
            _id: mongoObjectId,
            file_path,
            folder,
            file_extension,
            file_mime_type,
            file_original_name,
            file_size: 0,
            file_type: fileType,
            is_temp: false,
            user_id: userData._id,
          });

          return saveFile
            .save()
            .then((mongoObj) => {
              return res.status(httpStatus.CREATED).json({ file: mongoObj });
            })
            .catch((e) => next(e));
        }
      )
      .catch((e) => next(e));
  } catch (e) {
    next(e);
  }
};

exports.download = async (req, res, next) => {
  try {
    const {
      query: { width, height, format },
      params: { _id },
    } = req;

    let file;

    if (mongoose.Types.ObjectId.isValid(_id)) {
      file = await File.findOne({
        _id,
      });
    } else {
      throw new Error({
        message: "Invalid file id",
        status: httpStatus.BAD_REQUEST,
      });
    }

    if (!file) {
      throw new Error({
        message: "File is not available to download",
        status: httpStatus.BAD_REQUEST,
      });
    }

    // Set the content-type of the response

    const filePath = file.file_path;
    if (file.file_mime_type && file.file_mime_type.match("image")) {
      // Get the re sized image
      res.type(file.file_mime_type);
      fileService
        .resizeImage(filePath, format, Number(width), Number(height))
        .pipe(res);
    } else {
      fileService.streamFile(req, res, next, filePath, file.file_mime_type);
    }
  } catch (e) {
    next(e);
  }
};
