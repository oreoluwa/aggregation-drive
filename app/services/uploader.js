const fs = require('fs');
const Peers = require('weighted-round-robin');
const models = require('models').initializeModels();

const User = models.user;
const Identity = models.identity;
const Manifest = models.manifest;
const providerMap = {
  box: require('services/box'),
  dropbox: require('services/dropbox'),
  googleDrive: require('services/googleDrive'),
};

const getProviders = (identities = [], user) => {
  const providers = identities.reduce((acc, identity) => {
    const { provider } = identity
    acc[provider] = {
      handler: providerMap[provider],
      identity,
    }

    return acc;
  }, {});

  return providers;
}

const getUser = (userId) => User.findOne({
  where: {
    id: userId,
  },
  include: [Identity],
});

const getProviderHandler = async (providers, userId) => {
  const peers = new Peers();

  await Object.keys(providers).reduce(async (prevPromise, providerName) => {
    await prevPromise;

    const provider = providers[providerName];
    const { getClient, calculateQuotaUsage } = provider.handler.client;

    const client = await getClient(userId);
    const consumptionPct = await calculateQuotaUsage(client);

    peers.add({
      provider: {
        ...provider,
        client,
      },
      weight: consumptionPct,
    });
  }, Promise.resolve());

  return peers.get().provider;
}

const uploader = async (req, userFs) => {
  const user = await getUser(req.userId);

  const providers = getProviders(user.identities, user);

  Object.keys(userFs.userFiles).forEach(async (fileName) => {
    const fileInfo = JSON.parse(userFs.userFiles[fileName]);
    const dirInfo = userFs.dirStructure('/' + fileName);

    const handleUpload = async (retryCount = 5, attempt=0) => {
      try {
        const provider = await getProviderHandler(providers, user.id);

        const manifest = Manifest.build({
          parentId: '',
          name: dirInfo.name,
          fullPath: dirInfo.path,
          mimeType: fileInfo.mimetype,
          size: fileInfo.size,
          digest: fileInfo.filename,
          provider: provider.identity.provider,
          userId: user.id,
          metadata: fileInfo,
        });

        const stream = fs.createReadStream(fileInfo.path);
        await provider.handler.upload(provider.client, provider.identity, manifest, stream);

        await manifest.save();
        fs.unlinkSync(fileInfo.path);
      } catch(err) {
        console.error(err)
        if (retryCount > 0 ) {
          attempt++;
          retryCount--;

          setTimeout(() => handleUpload(retryCount, attempt), Math.min(attempt * 10000, 50000));
        } else {
          throw err;
        }
      }
    };

    handleUpload();
  });
}

module.exports = uploader;
