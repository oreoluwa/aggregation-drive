const { debugPrefix } = require('../package.json');
const debug = require('debug')(debugPrefix + ':read');
const { ENOENT, EISDIR } = require('./errorCodes');
const through = require('through2');

const read = async (withCache, path, fd, buffer, length, offset, cb) => {
  debug('read(%s, %d, %d, %d)', path, fd, length, offset)

  // depending
  const manifest = await withCache.findByFileDescriptor(fd);

  if (!manifest) return cb(ENOENT);
  if (manifest.type === 'folders') return cb(EISDIR);

  const bytesRange = `${offset}-${offset + length - 1}`

  const httpResponse = await withCache.httpClient.get(`download/${manifest.id}`, {
    responseType: 'stream',
    headers: {
      'Range': `bytes=${bytesRange}`
    }
  });

  const contentLength = httpResponse.headers['content-length'];

  const proxy = through();
  httpResponse.data.pipe(proxy);

  proxy.once('readable', function getContent () {
    const result = proxy.read(contentLength);
    if (!result) return getContent();
    result.copy(buffer);
    return cb(result.length);
  });
};

module.exports = read;
