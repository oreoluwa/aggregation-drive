const levelup = require('levelup')
const leveldown = require('leveldown')
const db = levelup(leveldown('./tokens'))

module.exports = db;
