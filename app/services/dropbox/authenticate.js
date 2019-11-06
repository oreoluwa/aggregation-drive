const dropboxSdk = require('config/components/dropbox');
const tokenStore = require('config/components/tokenStore');
const promisify = require('util').promisify;

const asyncGetToken = promisify(dropboxSdk.getToken);

const authenticate = async (userId, code) => {
  const tokenInfo = await asyncGetToken(code);

  const userStore = tokenStore('dropbox', userId);
  userStore.write(tokenInfo);

  return tokenInfo;
}

module.exports = {
  authenticate,
};
