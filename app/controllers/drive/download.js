const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const Drive = require('lib/drive/drive');
const File = require('lib/drive/file');
const Folder = require('lib/drive/folder');

const getManifestRef = (drive, manifest) => {
  if (manifest.isDirectory) {
    return new Folder(drive, manifest);
  } else {
    return new File(drive, manifest);
  }
};

const downloadController = (req, res) => (async () => {
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

  const docRef = getManifestRef(userDrive, manifest);

  if (!manifest.isDirectory) {
    res.set({
      'Content-Type': manifest.mimeType,
      'Content-Disposition': `attachment; filename="${manifest.name}"`,
      'Content-Length': docRef.size,
    });
  } else {
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment;filename="${manifest.name}.zip"`,
      'X-Original-Content-Length': docRef.size,
    });
  };

  return userDrive.download(res, manifest);
})().catch(console.error);

module.exports = downloadController;
