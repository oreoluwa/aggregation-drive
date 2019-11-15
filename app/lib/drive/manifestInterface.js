const servicesHelper = require('services/helpers');
const zlib = require('zlib');
const { PassThrough } = require('stream');

class ManifestInterface {
  constructor(drive, manifest) {
    this.drive = drive;
    this.manifest = manifest;
  }

  async download(stream) { throw new Error('NotImplementedError') };
  async upload(stream) { throw new Error('NotImplementedError') };
  async delete() { throw new Error('NotImplementedError') };
  async create() { throw new Error('NotImplementedError') };
  size() { throw new Error('NotImplementedError') };
}



module.exports = ManifestInterface;
