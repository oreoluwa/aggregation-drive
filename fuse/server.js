const polka = require('polka');
const localtunnel = require('localtunnel');
const axios = require('axios');
const {
  safeMemoryCache
} = require('safe-memory-cache');
const qs = require('querystring');
const sendResponse = require('@polka/send-type');

const downloadController = require('./controllers/download');

const util = require('util');
const logggg = (...args) => console.log('==> ==> => ->', util.inspect(args, false, null, true))

class Server {
  constructor(app) {
    this.app = app;
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://host.docker.internal:3001';

    this.axiosInstance = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 30000,
    });

    this.cache = safeMemoryCache({
      buckets: 3,
      maxTTL: 100000,
      limit: 50,
      cleanupListener: (removedBucket) => {
        logggg(removedBucket);
      }
    });
  }

  // get(idOrPath) {
  //
  // }


  // paramsSerializer: function (params) {
  //   return Qs.stringify(params, { arrayFormat: 'brackets' })
  // },

  proxyMiddleware() {
    return (req, res, next) => (async () => {
      console.log('==================>>>> GOT HERE', req.method, req.url, req.query);
      const { data, status, headers} = await this.axiosInstance({
        url: req.url,
        method: req.method,
        // params: req.query,
        headers: req.headers,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
      });

      return sendResponse(res, status, data, headers);
    })().catch(console.error);
  }

  setupApp() {
    this.app.use((req, res, next) => {
      req.proxyServer = this;
      next();
    });

    this.app.get('/download/:fileId', downloadController);
  }

  listen(port, host) {
    this.app.listen(port, host, () => {
      console.log('Server started on %s:%s', host, port);
    });
  }

  init() {
    this.setupApp();
    this.app.onNoMatch = this.proxyMiddleware();
    // this.subscribeToUpstream()

    return this;
  }

  static async start() {
    const listenHost = '0.0.0.0'
    // const listenHost = 'localhost'
    const serverPort = process.env.SERVER_PORT || 3000;

    const app = polka();
    const tunnel = await localtunnel({
      port: serverPort
    });

    console.log('Tunnel listening on %s', tunnel.url);

    tunnel.on('request', info => {
      logggg('Request for Server::: => ', info)
    })

    const server = new Server(app);

    server.init().listen(serverPort, listenHost);

    return server
  }
};

module.exports = Server;
