const { getAuthClient } = require('config/components/googleDrive');
const tokenStore = require('config/components/tokenStore');

const authenticate = async (userId, code) => {
  const authClient = getAuthClient();
  const tokenInfo = (await authClient.getToken(code)).tokens;

  const userStore = tokenStore('googleDrive', userId);
  userStore.write(tokenInfo);

  return tokenInfo;
}

module.exports = {
  authenticate,
}
