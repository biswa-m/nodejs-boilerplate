const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const Busboy = require("busboy");

const asyncFsMkdir = Promise.promisify(fs.mkdir);

async function mkDir(folderPath) {
  if (!fs.existsSync(folderPath)) {
    await asyncFsMkdir(folderPath, {
      mode: "0777",
      recursive: true,
    });
  }
}

/**
 * Add new file
 *
 * @public
 */
exports.write = async ({ req, folderPath, customFileName }, cb) => {
  const busboy = new Busboy({ headers: req.headers });

  req.pipe(busboy);

  busboy.on("file", async (fieldName, file, filename, encoding, mimeType) => {
    const extension = path.extname(filename);

    // make user id based folder in cdn folder if not exist
    await mkDir(folderPath);
    // Create a write` stream of the new file
    const fsStream = fs.createWriteStream(
      path.join(folderPath, customFileName + extension)
    );

    // Pipe it trough
    file.pipe(fsStream);

    // On finish of the upload
    fsStream.on("close", async () => {
      debug(
        `'${filename}' is successfully uploaded as ${
          customFileName + extension
        } in ${folderPath}`
      );

      return cb({
        file_path: folderPath + customFileName + extension,
        file_extension: extension,
        file_mime_type: mimeType,
        file_original_name: filename,
      });
    });
  });
};

exports.streamFile = (req, res, next, path, mime_type) => {
  try {
    mime_type && res.type(mime_type);

    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  } catch (e) {
    next(e);
  }
};

exports.resizeImage = function resizeImage(path, format, width, height) {
  const readStream = fs.createReadStream(path);

  let transform = sharp();

  if (format) {
    transform = transform.toFormat(format);
  }

  if (width || height) {
    transform = transform.resize(width, height);
  }

  return readStream.pipe(transform);
};
