const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const Drive = require('services/drive');

const downloadController = (req, res) => (async () => {
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

  if (!manifest.isDirectory) {
    res.set({
      'Content-Type': manifest.mimeType,
      'Content-Disposition': `attachment; filename="${manifest.name}"`,
    });

    return userDrive.downloadManifest(manifest, res);
  } else {
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment;filename="${manifest.name}.zip"`,
    });

    return userDrive.downloadDirectory(manifest, res);
  }
})().catch(console.error);

module.exports = downloadController;
