const dropboxV2Api = require('dropbox-v2-api');

const sdk = dropboxV2Api.authenticate({
    client_id: process.env.DROPBOX_CLIENT_ID,
    client_secret: process.env.DROPBOX_CLIENT_SECRET,
    redirect_uri: process.env.DROPBOX_REDIRECT_URI,
});

module.exports = sdk;
