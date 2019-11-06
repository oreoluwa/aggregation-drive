const { google } = require('googleapis');

const getAuthClient = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const getDrive = (authClient) => google.drive({ version: 'v3', auth: authClient });

module.exports = {
  getAuthClient,
  getDrive,
}
