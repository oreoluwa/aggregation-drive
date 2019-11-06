const boxService = require('services/box');

const loginController = (req, res) => {
  return res.redirect(boxService.authenticate.getAuthUrl())
}

module.exports = loginController;
