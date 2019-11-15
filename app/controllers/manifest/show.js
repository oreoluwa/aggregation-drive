const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const manifestSerializer = require('serializers/manifestSerializer');
const File = require('lib/drive/file');
const Folder = require('lib/drive/folder');

const getManifestRef = (manifest) => {
  if (manifest.isDirectory) {
    return new Folder({}, manifest);
  } else {
    return new File({}, manifest);
  }
};

const serializeChildren = (tree, collection=[]) => {
  return (tree.children || []).reduce((children, child) => {
    const serializedChild = manifestSerializer(child, { size: getManifestRef(child).size });
    return serializeChildren(child, children.concat(serializedChild));
  }, collection);
}

const getManifestController = (req, res) => (async () => {
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

  const overrideAttrs = {
    size: getManifestRef(manifest).size,
  };

  const data = manifestSerializer(manifest, overrideAttrs);
  let included = (req.query.include === 'children') ? serializeChildren(manifest) : undefined;
  return res.status(200).send({ data, included });
})().catch(console.error);

module.exports = getManifestController;
