const { userFs } = require('utils/userFs');
const { buildDBTree, extractManifestsFromTree } = require('helpers/tree');
const Drive = require('services/drive');

const uploadController = (req, res) => (async () => {
  const userDrive = await Drive.getUserDrive(req.userId);

  const { files } = req;

  // ############
  // These sections should probably move to the drive
  //
  // ############
  const userFakeFs = userFs(files);
  const dirStructure = userFakeFs.dirStructure('/');
  const persistedTree = await buildDBTree(req.userId, dirStructure);
  const manifests = extractManifestsFromTree(persistedTree);

  await userDrive.addFiles(manifests);

  return res.status(200).send(dirStructure);
})().catch(console.error);

module.exports = uploadController;
