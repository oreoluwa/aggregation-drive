const { getAuthClient, getDrive } = require('config/components/googleDrive');
const tokenStore = require('config/components/tokenStore');
const promisify = require('util').promisify;

const getClient = async (userId) => {
  const userStore = tokenStore('googleDrive', userId);
  const asyncTokenRead = promisify(userStore.read);
  const tokenInfo = await asyncTokenRead();

  const authClient = getAuthClient();
  authClient.setCredentials(tokenInfo);

  return getDrive(authClient);
}

const calculateQuotaUsage = async (client) => {
  const quotaUsageRes = await client.about.get({
   fields: ["storageQuota"],
  });

  const quotaUsage = quotaUsageRes.data.storageQuota;

  const totalUsed = quotaUsage.usage;
  const totalStorage = quotaUsage.limit;

  return (totalUsed / totalStorage) * 100;
}

const getStorageLimit = async (client) => {
  const quotaUsageRes = await client.about.get({
   fields: ["storageQuota"],
  });

  return parseInt(quotaUsageRes.data.storageQuota.limit, 10);
};

const getStorageUsage = async (client) => {
  const quotaUsageRes = await client.about.get({
   fields: ["storageQuota"],
  });

  return parseInt(quotaUsageRes.data.storageQuota.usage, 10);
};

module.exports = {
  getClient,
  calculateQuotaUsage,
  getStorageLimit,
  getStorageUsage,
}
