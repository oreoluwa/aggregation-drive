const { debugPrefix } = require('../package.json');
const debug = require('debug')( debugPrefix + ':mount');
const fs = require('fs');
const path = require('path');

const handlerCache = {
  force: true
};

// https://medium.com/@JosephJnk/partial-function-application-in-javascript-and-flow-7f3ca87074fe
const partialApply = (fn, ...args) => {
  return fn.bind(null, ...args);
}

const FUSE_FUNCTIONS = [
  'init',
  'access',
  'statfs',
  'getattr',
  'fgetattr',
  'flush',
  'fsync',
  'fsyncdir',
  'readdir',
  'truncate',
  'ftruncate',
  'readlink',
  'chown',
  'chmod',
  'mknod',
  'setxattr',
  'getxattr',
  'listxattr',
  'removexattr',
  'open',
  'opendir',
  'read',
  'write',
  'release',
  'releasedir',
  'create',
  'utimens',
  'unlink',
  'rename',
  'link',
  'symlink',
  'mkdir',
  'rmdir',
  'destroy',
];

module.exports = (cacheAgent) => {
  return FUSE_FUNCTIONS.reduce((acc, func) => {
    const pathName = path.resolve(__dirname, func + '.js');
    if (fs.existsSync(pathName)) {
      debug('Added handler for %s', func);

      let actionHandler = require(pathName);
      if (typeof actionHandler === 'function') acc[ func ] = partialApply(actionHandler, cacheAgent);
    }
    return acc;
  }, handlerCache);
};
