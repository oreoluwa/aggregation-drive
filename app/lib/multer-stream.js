const Drive = require('services/drive');
const crypto = require('crypto');
const { PassThrough } = require('stream');

class MulterMultiStorage {
  constructor(opts) {
    // ADDME
  }

  _handleFile (req, file, cb) {
    const handleUpload = async (req, file, cb) => {
      const userDrive = await Drive.getUserDrive(req.userId);
      const rawDigest = crypto.pseudoRandomBytes(16);
      const filename = rawDigest.toString('hex');

      const stream = new PassThrough();

      let size = 0;
      stream.on('data', (chunk) => {
        size += chunk.length;
      });

      file.stream.pipe(stream);

      let err, response;
      try {
        const [ provider, providerManifestId ] = await userDrive.uploadStream(stream, filename);
        response = {
          filename,
          provider,
          providerManifestId,
          size,
        };
      } catch(error) {
        err = error;
      }

      return cb(err, response);
    };

    return handleUpload(req, file, cb);
  }

  _removeFile (req, file, cb) {
    const handleRemoval = async (req, file, cb) => {
      const userDrive = await Drive.getUserDrive(req.userId);
      const { provider, providerManifestId } = file;

      let err, response;
      try {
        response = await userDrive.removeFile(provider, providerManifestId);
      } catch(error) {
        err = error;
      }

      delete file.filename;
      delete file.provider;
      delete file.providerManifestId;

      return cb(err, response);
    };

    return handleRemoval(req, file, cb);
  }
}

module.exports = (opts) => {
  return new MulterMultiStorage(opts);
}
