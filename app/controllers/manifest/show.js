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

const serializeRecords = (tree, collection=[], accessor='children') => {
  return (tree[accessor] || []).reduce((collector, record) => {
    const serializedRecord = manifestSerializer(record, { size: getManifestRef(record).size });
    return serializeRecords(record, collector.concat(serializedRecord), accessor);
  }, collection);
}

const getManifestController = (req, res) => (async () => {
  const includeQuery = [].concat(req.query.include);
  const include = [];
  let order = [];
  if (includeQuery.includes('children')) {
    include.push({
      model: Manifest,
      as: 'descendents',
      hierarchy: true,
    });
  }
  if (includeQuery.includes('parents')) {
    include.push({
      model: Manifest,
      as: 'ancestors',
    });
    order = order.concat([
      [{
        model: Manifest,
        as: 'ancestors'
      }, 'hierarchyLevel']
    ])
  };

  const manifest = await Manifest.findOne({
    where: {
      id: req.fileId || req.params.fileId,
      userId: req.userId,
    },
    include,
    order,
  });

  const overrideAttrs = {
    size: getManifestRef(manifest).size,
  };

  const data = manifestSerializer(manifest, overrideAttrs);
  let included;
  if (includeQuery.includes('children')) included = serializeRecords(manifest, (included || []), 'children');
  if (includeQuery.includes('parents')) included = serializeRecords(manifest, (included || []), 'ancestors');

  return res.status(200).send({ data, included });
})().catch(console.error);

module.exports = getManifestController;
