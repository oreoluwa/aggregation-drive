const { debugPrefix } = require('../package.json');
const debug = require('debug')( debugPrefix + ':readdir');
const { ENOENT } = require('./errorCodes');

const readdir = async (withCache, path, cb) => {
  debug('readdir(%s)', path);

  const manifest = await withCache.findByPath(path);

  if (!manifest) return cb(ENOENT);

  const children = await manifest.relationships.children.data.reduce(async (asyncAcc, child) => {
    asyncAcc = await asyncAcc;
    const childName = ( await withCache.findById(child.id) ).attributes.name;

    asyncAcc.push(childName);
    return asyncAcc;
  }, Promise.resolve([]));

  return cb(0, children);
}

module.exports = readdir;
