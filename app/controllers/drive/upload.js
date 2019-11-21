const {
  userFs
} = require('utils/userFs');
const {
  buildDBTree,
  extractManifestsFromTree
} = require('helpers/tree');
const Drive = require('services/drive');
const manifestSerializer = require('serializers/manifestSerializer');
const {
  ROOT_PATH
} = require('config/components/variables');

const uploadController = (req, res) => (async () => {
  const userDrive = await Drive.getUserDrive(req.userId);

  const {
    files,
    rootNode,
  } = req;

  // ############
  // These sections should probably move to the drive
  //
  // ############
  const userFakeFs = userFs(files);
  const dirStructure = userFakeFs.dirStructure(ROOT_PATH);
  const persistedTree = await buildDBTree(req.userId, dirStructure, rootNode);

  return res.status(200).send(persistedTree.children.map(child => manifestSerializer(child.self)));
})().catch(console.error);

module.exports = uploadController;
