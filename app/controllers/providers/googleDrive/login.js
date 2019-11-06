const { getAuthClient } = require('config/components/googleDrive');

const loginController = (req, res) => {

  const authorizeUrl = getAuthClient().generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  
  return res.redirect(authorizeUrl);
}

module.exports = loginController;
