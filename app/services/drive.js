const models = require('models').initializeModels();
const User = models.user;
const Identity = models.identity;
const Manifest = models.manifest;
const helper = require('services/helpers');
const Balancer = require('weighted-round-robin');

class Drive {
  constructor(user, identities) {
    this.userId = user.id;
    this.user = user;
    this.identities = identities || [];
    this.storage = new Storage(this.userId);
  };

  async init() {
    await this.addStorageIdentities();

    return this;
  }

  async addStorageIdentities () {

    await this.identities.reduce(async (asyncAcc, identity) => {
      await asyncAcc;

      // console.log('==> helper', helper)

      const storageService = helper.services[identity.provider].client;
      const client = await storageService.getClient(this.userId);
      // based on some other user configurations, determine the weight;
      // right now using the available storage space proportion to determine the
      // weight.
      const weight = await storageService.calculateQuotaUsage(client);

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
  }

  async driveLimit () {
    return this.identities.reduce(async (asyncAcc, identity) => {
      let total = await asyncAcc;
      const storageService = helper.services[identity.provider].client;
      const client = await storageService.getClient(this.userId);
      const serviceTotal = await storageService.getStorageLimit(client);

      return total + serviceTotal;
    }, Promise.resolve(0));
  };

  async driveUsage () {
    return this.identities.reduce(async (asyncAcc, identity) => {
      let total = await asyncAcc;
      const storageService = helper.services[identity.provider].client;
      const client = await storageService.getClient(this.userId);
      const serviceTotal = await storageService.getStorageUsage(client);

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
