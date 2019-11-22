const fuse = require('fuse-bindings');
const axios = require('axios');
const Server = require('./proxyServer');
const {
  safeMemoryCache
} = require('safe-memory-cache');
const { debugPrefix } = require('./package.json');
const debug = require('debug')(debugPrefix)

const cacheHandler = require('helpers/cache');
const mountHandler = require('mount/index');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer xyz'
  },
  validateStatus: () => true
});

const cache = safeMemoryCache({
  buckets: 3,
  maxTTL: 100000,
  limit: 50,
  cleanupListener: (removedBucket) => {
    debug.extend('safeMemoryCache')(removedBucket);
  }
});

const cacheAgent = cacheHandler(cache, axiosInstance);

const mountPath = process.platform !== 'win32' ? './mnt' : 'M:\\'

module.exports = (async () => {
  const server = await Server.start(cache);
  fuse.mount(mountPath, mountHandler(cacheAgent), (err) => {
    if (err) throw err

    console.log('filesystem mounted on ' + mountPath)
  });
})().catch(console.error);

const unmount = (mountPath, cb) => fuse.unmount(mountPath, (err) => {
  if (err) {
    console.error('filesystem at ' + mountPath + ' not unmounted', err);
  } else {
    console.log('filesystem at ' + mountPath + ' unmounted');
  }
  return cb(err);
});

process.on('SIGINT', () => {
  return unmount(mountPath, (err) => {
    if (err) return process.exit(1)
    process.exit(0)
  })
});

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
});

process.on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown');
  return unmount(mountPath, (err) => {
    process.exit(1);
  });
});
