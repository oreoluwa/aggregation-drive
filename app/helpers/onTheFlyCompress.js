const fs = require('fs');
const { TEMPORARY_FILE_PATH } = require('config/components/variables');
const path = require('path');
const { PassThrough } = require('stream');
const zlib = require('zlib');

const bufferToDisk = (stream, fileName, callback) => {
  const pathName = path.join(TEMPORARY_FILE_PATH, fileName);
  const writeableStream = fs.createWriteStream(pathName);

  stream.pipe(writeableStream).on('error', callback);

  stream.on('end', () => {
    // writeableStream.end();

    callback(null, readFromDisk(fileName));
  });

  return stream;
}

const readFromDisk = (fileName) => {
  const pathName = path.join(TEMPORARY_FILE_PATH, fileName);
  const readableStream = fs.createReadStream(pathName);

  readableStream.on('close', () => {
    fs.unlinkSync(pathName);
  });

  return readableStream;
}

module.exports = bufferToDisk;
