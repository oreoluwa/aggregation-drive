'use strict';

const Sequelize = require('sequelize');
const config = require('../config.json');

require('sequelize-hierarchy')(Sequelize);
module.exports = new Sequelize(config[process.env.NODE_ENV]);
