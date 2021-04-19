const debug = require('debug')('connector:controllers');
const path = require('path');
const handlerCache = {};
const handler = {
  get: (controllerCache, controller) => {
    debug.extend(controller)('Fetching Handler for: %s', controller);

    if (controllerCache.hasOwnProperty(controller)) return controllerCache[controller];

    debug.extend(controller)('Handler for %s did not exist. Caching it.', controller);
    return handlerCache[controller] = require(path.resolve(__dirname, controller + '.js'));
  },
  set: (controllerCache, controller, value) => {
    throw new Error('NOT_PERMITTED');
  },
}

module.exports = new Proxy(handlerCache, handler);
