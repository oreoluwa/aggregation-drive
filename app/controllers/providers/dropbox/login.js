const dropboxSdk = require('config/components/dropbox');

const loginController = (req, res) => {
  return res.redirect(dropboxSdk.generateAuthUrl());
}

module.exports = loginController;
