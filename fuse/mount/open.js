const { debugPrefix } = require('../package.json');
const debug = require('debug')( debugPrefix + ':open' );
const { ENOENT } = require('./errorCodes');

const toFlag = (flags) => {
  flags = flags & 3;
  if (flags === 0) return 'r';
  if (flags === 1) return 'w';
  return 'r+';
}

const open = async (withCache, path, flags, cb) => {
  debug('open(%s, %d)', path, flags);

  const openFlag = toFlag(flags);
  const fd = await withCache.getFileDescriptor(path, openFlag);
  if (!fd && fd !== 0) return cb(ENOENT)

  cb(0, fd);
};

module.exports = open;
