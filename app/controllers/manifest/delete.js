const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const manifestSerializer = require('serializers/manifestSerializer');
const Drive = require('lib/drive/drive');

const deleteManifestController = (req, res) => (async () => {
  const userDrive = await Drive.getUserDrive(req.userId);
  const manifest = await Manifest.findOne({
    where: {
      id: req.fileId || req.params.fileId,
      userId: req.userId,
    },
    include: {
      model: Manifest,
      as: 'descendents',
      hierarchy: true,
    }
  });

  const deleted = await userDrive.delete(manifest);
  return res.status(200).send(manifestSerializer(deleted, { deletedAt: new Date() }));
})().catch(console.error);

module.exports = deleteManifestController;
