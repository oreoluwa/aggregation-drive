const polka = require('polka');
const localtunnel = require('localtunnel');
const axios = require('axios');
const {
  safeMemoryCache
} = require('safe-memory-cache');
const qs = require('querystring');
const sendResponse = require('@polka/send-type');
const bodyParser = require('body-parser');
const { debugPrefix } = require('./package.json');
const debug = require('debug')( debugPrefix + ':proxyServer');

const downloadController = require('./controllers/download');
const webhooksController = require('./controllers/webhooks');

class Server {
  constructor(app, publicUrl, cache) {
    this.publicUrl = publicUrl;
    this.app = app;
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://host.docker.internal:3001';

    this.axiosInstance = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Authorization': 'Bearer xyz',
      }
    });

    this.cache = cache || safeMemoryCache({
      buckets: 3,
      maxTTL: 100000,
      limit: 50,
      cleanupListener: (removedBucket) => {
        debug.extend('safeMemoryCache')(removedBucket);
      }
    });
  }

  proxyMiddleware() {
    return (req, res, next) => (async () => {
      const { data, status, headers} = await this.axiosInstance({
        url: req.url,
        method: req.method,
        headers: req.headers,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
      });

      return sendResponse(res, status, data, headers);
    })().catch(console.error);
  }

  setupApp() {
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    this.app.use(bodyParser.json());

    this.app.use((req, res, next) => {
      debug.extend('request')('%s %s', req.method, req.url)
      debug.extend('request:query')(JSON.stringify(req.query))
      debug.extend('request:headers')(JSON.stringify(req.headers))

      req.proxyServer = this;
      next();
    });

    this.app.get('/download/:fileId', downloadController);
    this.app.post('/webhooks', webhooksController);
  }

  listen(port, host) {
    this.app.listen(port, host, () => {
      console.log('Server started on %s:%s', host, port);
    });
  }

  subscribeToUpstream() {
    this.axiosInstance.post('/subscribe', {
      data: {
        type: 'webhooks',
        attributes: {
          endpoint: `${this.publicUrl}/webhooks`,
          active: true,
          name: 'MountedFS',
          auth: {
            type: 'basic',
            username: 'admin',
            password: 'password',
          }
        },
        meta: {
          disableOtherEndpoints: true,
        }
      }
    });
  }

  init() {
    this.setupApp();
    this.app.onNoMatch = this.proxyMiddleware();
    this.subscribeToUpstream()

    return this;
  }

  static async start(cache) {
    // const listenHost = '0.0.0.0'
    const listenHost = 'localhost'
    const serverPort = process.env.SERVER_PORT || 3000;

    const app = polka();
    // tunnel needed for webhooks(localhost can work for authentication). Need to setup a more secured tunnel;
    const tunnel = await localtunnel({
      port: serverPort,
      subdomain: 'multicloud-app-12345-main-random'
    });

    const publicUrl = tunnel.url;

    console.log('Tunnel listening on %s', publicUrl);

    tunnel.on('request', info => {
      debug.extend('localtunnel:external')(JSON.stringify(info));
    });

    const server = new Server(app, publicUrl, cache);

    server.init().listen(serverPort, listenHost);

    return server
  }
};

module.exports = Server;
