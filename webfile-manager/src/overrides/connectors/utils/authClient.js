const superagent = require('superagent');

module.exports = (fetchToken) => {
  const authHeader = {};

  const setHeader = () => {
    const token = fetchToken();
    if (token) authHeader['Authorization'] = `Bearer ${token}`;
  }

  const handler = {
    get: (target, action) => {
      setHeader()
      return target[action].set(authHeader);
    },
    apply: (target, thisArg, argumentsList) => {
      setHeader()
      return target(...argumentsList).set(authHeader);
    }
  }

  return new Proxy(superagent, handler);
};
