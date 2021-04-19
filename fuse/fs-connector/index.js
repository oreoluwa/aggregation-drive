const path = require('path');
const filemanager = require('@opuscapita/filemanager-server');

const config = {
  fsRoot: path.resolve(__dirname, '../mnt'),
  rootName: 'Root folder',
  port: process.env.NODE_CONNECTOR_PORT || '3002',
  host: process.env.NODE_CONNECTOR_HOST || 'localhost'
};

filemanager.server.run(config);
