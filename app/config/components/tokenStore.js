const db = require('config/components/leveldb');

const getKey = (namespace, userId) => `__${ namespace }_user_${ userId }`;

const read = (userId) => (callback) => {
  return db.get(userId, (err, value) => callback(err, JSON.parse(value)));
}

const write = (userId) => (tokenInfo, callback) => {
  return db.put(userId, JSON.stringify(tokenInfo), callback)
}

const clear = (userId) => (callback) => {
  return db.del(userId);
}

module.exports = (namespace, userId) => {
  const userKey = getKey(namespace, userId);
  return {
    read: read(userKey),
    write: write(userKey),
    clear: clear(userKey),
  };
}
