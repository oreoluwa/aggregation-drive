const crypto = require('crypto');
const ManifestInterface = require('./manifestInterface');
const servicesHelper = require('services/helpers');
const { PassThrough } = require('stream');
const zlib = require('zlib');

const collector = new Set();

class File extends ManifestInterface {
  get size () {
    return this.manifest.size;
  }

  async download (writeableStream) {
    const readStream = await this.getReadableStream();
    return readStream.pipe(writeableStream);
  };

  async delete () {
    const { provider, providerManifestId } = this.manifest;
    const clientService = servicesHelper.services[ provider ].client;
    const client = await clientService.getClient(this.drive.userId);

    await servicesHelper.services[ provider ].remove(client, providerManifestId);

    if (this.manifest.id) {
      await this.manifest.destroy();
    }

    return true;
  }

  async getUploadHelper () {
    const manifest = this.manifest;
    let uploadHelper;
    if (!manifest.id) {
      const rawDigest = crypto.pseudoRandomBytes(16);
      const fileDigest = rawDigest.toString('hex');
      const filename = `${ fileDigest }.gz`;

      const currentStorage = this.drive.storage.getIdentity();
      const identity = currentStorage.identity;
      const client = currentStorage.client;

      uploadHelper = {
        filename,
        identity,
        client,
      }
    } else {
      const { provider, providerManifestId, digest } = manifest;
      const clientService = servicesHelper.services[ provider ].client;
      const client = await clientService.getClient(this.drive.userId);

      uploadHelper = {
        filename: manifest.digest,
        client,
        fileId: providerManifestId,
        identity: this.drive.identities[provider],
      }
    }

    return uploadHelper;
  }

  async upload (stream) {
    const {
      filename,
      client,
      fileId,
      identity,
    } = await this.getUploadHelper();

    const compress = zlib.createGzip();
    const destination = new PassThrough();

    const compressedStream = stream.pipe(compress);
    compressedStream.pipe(destination);

    const providerManifestId = await servicesHelper.uploader.uploadStream(client, identity, destination, filename, fileId);

    return {
      provider: identity.provider,
      fileId: providerManifestId,
      fileName: filename,
    }
  };

  async uploadWithManifest (client, identity) {
    const manifest = this.manifest;
    const fileId = await servicesHelper.uploader.upload(client, identity, manifest);
    manifest.providerManifestId = fileId;
    manifest.provider = identity.provider;

    await manifest.save();

    return manifest;
  };

  async getReadableStream() {
    const { digest, provider, providerManifestId: documentId } = this.manifest;
    const { folderId, folderName } = this.drive.identities[ provider ];
    const storageService = servicesHelper.services[ provider ];

    const client = await storageService.client.getBasicClient(this.drive.userId);
    const readStream = await storageService.download(client, folderId, folderName, documentId, digest);

    const decompress = zlib.createGunzip();

    return readStream.pipe(decompress);
  };
}

module.exports = File;
