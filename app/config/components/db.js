'use strict';

const Sequelize = require('sequelize');
const config = require('../config.json');

module.exports = new Sequelize(config[process.env.NODE_ENV]);
