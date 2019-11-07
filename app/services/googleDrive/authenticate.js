const { getAuthClient } = require('config/components/googleDrive');
const tokenStore = require('config/components/tokenStore');
const promisify = require('util').promisify;

const authenticate = async (userId, code) => {
  const authClient = getAuthClient();
  const tokenInfo = (await authClient.getToken(code)).tokens;

  const userStore = tokenStore('googleDrive', userId);

  const asyncTokenRead = promisify(userStore.read);

  let oldToken;
  try {
    oldToken = await asyncTokenRead();
  } catch(err) {
    console.error(err);
    oldToken = {};
  };

  // retain the refresh_token and other metadata
  userStore.write({...oldToken, ...tokenInfo });

  return tokenInfo;
}

module.exports = {
  authenticate,
}
