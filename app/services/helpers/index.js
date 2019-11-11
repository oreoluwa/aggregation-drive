const path = require('path');

module.exports = {
  services: {},
};

const services = ['box', 'dropbox', 'googleDrive'];

services.forEach(service => {
  module.exports.services[service] = require(path.resolve(__dirname, '..', service));
});

module.exports.drive = require('services/drive');
module.exports.uploader = require('services/uploader');
