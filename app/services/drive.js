const models = require('models').initializeModels();
const User = models.user;
const Identity = models.identity;
const Manifest = models.manifest;
const helper = require('services/helpers');
const Balancer = require('weighted-round-robin');
const archiver = require('archiver');

const mapIdentities = (identities) => identities.reduce((acc, identity) => {
  acc[identity.provider] = identity;

  return acc;
}, {});

class Drive {
  constructor(user, identities) {
    this.userId = user.id;
    this.user = user;
    this.identities = mapIdentities(identities || []);
    this.storage = new Storage(this.userId);
  };

  async init() {
    await this.addStorageIdentities();

    return this;
  }

  async addStorageIdentities () {
    await Object.keys(this.identities).reduce(async (asyncAcc, identityProvider) => {
      await asyncAcc;
      const identity = this.identities[identityProvider];

      const clientService = helper.services[identityProvider].client;
      const client = await clientService.getClient(this.userId);
      // based on some other user configurations, determine the weight;
      // right now using the available storage space proportion to determine the
      // weight.
      const weight = await clientService.calculateQuotaUsage(client);

      this.storage.addIdentity(identity, client, weight);
    }, Promise.resolve());
  }

  async addFiles (manifests) {
    return await manifests.reduce(async (asyncAcc, manifest) => {
      const uploadedManifests = await asyncAcc;
      const currentStorage = this.storage.getIdentity();
      const identity = currentStorage.identity;
      const client = currentStorage.client;

      const currentManifest = await this.uploadManifest(client, identity, manifest);

      return uploadedManifests.concat(currentManifest);
    }, Promise.resolve([]));
  }

  async uploadManifest (client, identity, manifest) {
    const fileId = await helper.uploader.upload(client, identity, manifest);
    manifest.providerManifestId = fileId;
    manifest.provider = identity.provider;

    await manifest.save();

    return manifest;
  };

  async uploadStream (stream, digest) {
    const currentStorage = this.storage.getIdentity();
    const identity = currentStorage.identity;
    const client = currentStorage.client;

    const providerManifestId = await helper.uploader.uploadStream(client, identity, stream, digest);

    return [ identity.provider, providerManifestId ];
  };

  async removeFile (identityProvider, providerManifestId) {
    const clientService = helper.services[ identityProvider ].client;
    const client = await clientService.getClient(this.userId);

    return helper.services[ identityProvider ].remove(client, providerManifestId);
  }

  async getReadableStream(manifest) {
    const { digest, provider, providerManifestId: documentId } = manifest;
    const { folderId, folderName } = this.identities[ provider ];
    const storageService = helper.services[ provider ];

    const client = await storageService.client.getBasicClient(this.userId);
    const readStream = await storageService.download(client, folderId, folderName, documentId, digest);

    return readStream;
  }

  async downloadManifest (manifest, writeableStream) {
    const readStream = await this.getReadableStream(manifest);
    return readStream.pipe(writeableStream);
  };

  async downloadDirectory (manifest, writeableStream, archiveFormat='zip') {
    const archive = archiver(archiveFormat, {
      gzip: true,
      zlib: {
        level: 9,
      },
    });

    archive.pipe(writeableStream);

    const recurseAppendFile = async (tree, archive) => {
      if (!tree.isDirectory) {
        const readStream = await this.getReadableStream(tree);
        let filePath = tree.fullPath;
        filePath = filePath[0] === '/' ? filePath.substr(1) : filePath;

        return archive.append(readStream, { name: filePath });
      };

      return tree.children.reduce(async (asyncAcc, childTree) => {
        await asyncAcc;
        return recurseAppendFile(childTree, archive);
      }, Promise.resolve());
    };

    await recurseAppendFile(manifest, archive);

    return archive.finalize();
  }

  async driveLimit () {
    return Object.keys(this.identities).reduce(async (asyncAcc, identityProvider) => {
      let total = await asyncAcc;

      const clientService = helper.services[ identityProvider ].client;
      const client = await clientService.getClient(this.userId);
      const serviceTotal = await clientService.getStorageLimit(client);

      return total + serviceTotal;
    }, Promise.resolve(0));
  };

  async driveUsage () {
    return Object.keys(this.identities).reduce(async (asyncAcc, identityProvider) => {
      let total = await asyncAcc;

      const clientService = helper.services[ identityProvider ].client;
      const client = await clientService.getClient(this.userId);
      const serviceTotal = await clientService.getStorageUsage(client);

      return total + serviceTotal;
    }, Promise.resolve(0));
  };

  static async getUserDrive(userId) {
    if (!userId) throw new Error('userId not present');

    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: [Identity]
    });

    const identities = user.identities;
    const drive = new Drive(user, identities);
    await drive.init();

    return drive;
  };
};

class Storage {
  constructor(userId) {
    this.userId = userId;
    this.providers = new Balancer();
  }

  addIdentity(identity, client, weight) {
    return this.providers.add({
      identity,
      weight,
      client,
    });
  }

  getIdentity () {
    return this.providers.get();
  }
}

module.exports = Drive;
