const Models = require('models').initializeModels();
const Manifest = Models.manifest;

// const Folder = require('lib/drive/folder');
// const File = require('lib/drive/file');
const Drive = require('lib/drive/drive');

const manifestSizeController = (req, res) => (async () => {
  const userDrive = await Drive.getUserDrive(req.userId);
  const manifest = await Manifest.findOne({
    where: {
      id: req.params.fileId,
      userId: req.userId,
    },
    include: {
      model: Manifest,
      as: 'descendents',
      hierarchy: true,
    }
  });

  return res.status(200).send({ size: userDrive.getSize(manifest) });
})().catch(console.error);

module.exports = manifestSizeController;
