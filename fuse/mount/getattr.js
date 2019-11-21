const { debugPrefix } = require('../package.json');
const debug = require('debug')(debugPrefix + ':getattr');
const { ENOENT } = require('./errorCodes');

const getattr = async (withCache, path, cb) => {
  debug('getattr(%s)', path);

  const manifest = await withCache.findByPath(path);

  if (!manifest) return cb(ENOENT);

  const uid = process.getuid ? process.getuid() : 0;
  const gid = process.getgid ? process.getgid() : 0;
  // still need to take care of the permissions here
  const mode = manifest.type === 'folders' ? 16877 : 33206;

  const pathInfo = {
    mtime: new Date(manifest.attributes.updatedAt),
    atime: new Date(),
    ctime: new Date(manifest.attributes.createdAt),
    nlink: 1,
    size: manifest.attributes.size,
    mode,
    uid,
    gid,
  };

  return cb(0, pathInfo);
};

module.exports = getattr;
