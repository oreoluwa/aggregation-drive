const boxSdk = require('config/components/box');
const promisify = require('util').promisify;
const tokenStore = require('config/components/tokenStore');

boxSdk.altGetTokensAuthorizationCodeGrant = promisify(boxSdk.getTokensAuthorizationCodeGrant);

const getAuthUrl = () => {
  return boxSdk.getAuthorizeURL({
  	response_type: 'code'
  });
}

const authenticate = async (userId, code) => {
  const tokenInfo = await boxSdk.altGetTokensAuthorizationCodeGrant(code, null);
  const userStore = tokenStore('box', userId);
  userStore.write(tokenInfo);

  return tokenInfo;
}

module.exports = {
  getAuthUrl,
  authenticate,
};
