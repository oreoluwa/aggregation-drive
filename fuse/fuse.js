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

process.on('SIGINT', () => {
  fuse.unmount(mountPath, (err) => {
    if (err) {
      console.log('filesystem at ' + mountPath + ' not unmounted', err)
      process.exit(1)
    } else {
      console.log('filesystem at ' + mountPath + ' unmounted')
      process.exit(0)
    }
  })
});

process.on('uncaughtException', (err) => {
  console.log(err);
});
