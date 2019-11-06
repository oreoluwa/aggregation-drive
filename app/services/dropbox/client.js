const tokenStore = require('config/components/tokenStore');
const dropboxV2Api = require('dropbox-v2-api');
const promisify = require('util').promisify;

const getClient = async (userId) => {
  const userStore = tokenStore('dropbox', userId);
  const asyncTokenRead = promisify(userStore.read);
  const tokenInfo = await asyncTokenRead();

  const client = dropboxV2Api.authenticate({
    token: tokenInfo.access_token,
  });

  return promisify(client)
}

const calculateQuotaUsage = async (client) => {
  const quotaUsage = await client({
    resource: 'users/get_space_usage',
  });

  const totalUsed = quotaUsage.used;
  const totalStorage = quotaUsage.allocation.allocated

  return (totalUsed / totalStorage) * 100;
}

module.exports = {
  getClient,
  calculateQuotaUsage,
};
