const tokenStore = require('config/components/tokenStore');
const boxSdk = require('config/components/box');
const promisify = require('util').promisify;

const getClient = async (userId) => {
  return getBasicClient(userId);
};

const getBasicClient = async (userId) => {
  const userStore = tokenStore('box', userId);
  const asyncTokenRead = promisify(userStore.read);
  const tokenInfo = await asyncTokenRead();

  return boxSdk.getPersistentClient(tokenInfo, userStore);
};

const calculateQuotaUsage = async (client) => {
  const user = await client.users.get(client.CURRENT_USER_ID);

  const totalUsed = user.space_used;
  const totalStorage = user.space_amount;

  return (totalUsed / totalStorage) * 100;
};

const getStorageLimit = async (client) => {
  const user = await client.users.get(client.CURRENT_USER_ID);

  return parseInt(user.space_amount, 10); // bytes
};

const getStorageUsage = async (client) => {
  const user = await client.users.get(client.CURRENT_USER_ID);

  return parseInt(user.space_used, 10); // bytes
};

module.exports = {
  getClient,
  getBasicClient,
  calculateQuotaUsage,
  getStorageLimit,
  getStorageUsage,
};
