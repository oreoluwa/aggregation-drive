const crypto = require('crypto');
const { PassThrough } = require('stream');

const util = require('util');
const logggg = (...args) => console.log('==> ==> => ->', util.inspect(args, false, null, true))

class MulterMultiStorage {
  constructor(userDrive) {
    // ADDME
    this.userDrive = userDrive;
  }

  _handleFile (req, file, cb) {
    const handleUpload = async (req, file, cb) => {
      const utilStream = new PassThrough();
      const stream     = new PassThrough();

      let size = 0;
      const hash = crypto.createHash('sha1');
      let sha1sum;

      utilStream.on('data', (chunk) => {
        size += chunk.length;
        hash.update(chunk);
      });

      utilStream.on('end', () => {
        sha1sum = hash.digest('hex');
      })

      file.stream.pipe(utilStream);
      file.stream.pipe(stream);

      let err, response;
      try {
        const {
          provider,
          fileId,
          fileName,
        } = await this.userDrive.directUpload(stream, file);

        response = {
          filename: fileName,
          provider,
          providerManifestId: fileId,
          size,
          sha1sum,
        };
      } catch (error) {
        console.log('==> error => -> ', error)
        // logggg('==> error => ->', error.response)
        err = error;
      }

      return cb(err, response);
    };

    return handleUpload(req, file, cb);
  }

  _removeFile (req, file, cb) {
    const handleRemoval = async (req, file, cb) => {
      const { provider, providerManifestId } = file;

      let err, response;
      try {
        response = await this.userDrive.removeFile(provider, providerManifestId);
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
