const path = require('path');

module.exports.ROOT_PATH = '/root';
module.exports.ROOT_NAME = 'root';
module.exports.ROOT_PREFIX = '/root/';
module.exports.ROOT_PREFIX_REGEX = /^\/root\//gi;
module.exports.ROOT_PREFIX_REGEX_FULLPATH = /^\/root\/?/gi;
module.exports.TEMPORARY_FILE_PATH = path.join(process.cwd(), 'uploads');
