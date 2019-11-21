const path = require('path');
const { ROOT_PATH } = require('config/components/variables');
const models = require('models').initializeModels();
const User = models.user;
const Identity = models.identity;
const Manifest = models.manifest;
const helper = require('services/helpers');

const Storage = require('./storage');
const File = require('./file');
const Folder = require('./folder');

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

  getDocument(manifest) {
    let document;
    if (manifest.isDirectory) {
      document = new Folder(this, manifest);
    } else {
      document = new File(this, manifest);
    }

    return document;
  }

  getSize (manifest) {
    return this.getDocument(manifest).size;
  }

  async delete (manifest) {
    return this.getDocument(manifest).delete();
  }

  async upload(stream, manifest) {
    return this.getDocument(manifest).upload(stream);
  }

  async directUpload (stream, file) {
    let manifest = await this.getManifestByFilename(file.originalname);
    if (!manifest) {
      manifest = {
        isDirectory: false
      }
    }

    return this.getDocument(manifest).upload(stream);
  }

  async download(stream, manifest) {
    return this.getDocument(manifest).download(stream);
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

  async getManifestByFilename (filePath) {
    return Manifest.findOne({
      where: {
        fullPath: path.join(ROOT_PATH, filePath),
        userId: this.userId,
      }
    });
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

module.exports = Drive;
