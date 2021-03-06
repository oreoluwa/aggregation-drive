const googleDriveService = require('services/googleDrive');
const models = require('models').initializeModels();
const Identity = models.identity;

const callbackController = (req, res) => (async () => {
  const code = req.query.code;

  if(!code) return res.status(400).send({
    errors: {
      provider: req.query.code,
      message: 'Login Error. No code sent',
    }
  });

  const token = await googleDriveService.authenticate.authenticate(req.userId, code);

  const { getClient } = googleDriveService.client;

  const client = await getClient(req.userId);

  const findAttr = {
    userId: req.userId,
    provider: 'googleDrive',
  }
  const [identity, created] = await Identity.findOrCreate({
    where: findAttr,
    defaults: findAttr,
  });

  const { getOrcreateStorageFolder } = googleDriveService.utils;

  await getOrcreateStorageFolder(client, identity);

  return res.status(200).send(token);
})().catch(console.error);

module.exports = callbackController;
