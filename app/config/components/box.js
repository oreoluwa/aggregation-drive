const BoxSDK = require('box-node-sdk');

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID,
  clientSecret: process.env.BOX_CLIENT_SECRET,
});

module.exports = sdk;
