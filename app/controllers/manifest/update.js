const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const manifestSerializer = require('serializers/manifestSerializer');
const notificationsHelper = require('helpers/webhookHandler');
// const util = require('util');
// const logggg = (...args) => console.log('==> ==> => ->', util.inspect(args, false, null, true))

const updateTree = (tree, updatedRecords, ancestorsPath = []) => {
  const currentPath = ancestorsPath.concat(tree.name);
  const {
    children: _,
    ...rawAttributes
  } = tree.dataValues;
  const record = { ...rawAttributes,
    pathArray: currentPath
  };
  updatedRecords.push(record);

  if (tree.isDirectory) {
    tree.children.forEach(child => updateTree(child, updatedRecords, currentPath));
  }

  return true;
}

const basePermittedUpdateAttributes = ['name', 'parentId']

const validateBody = (body, manifest, permittedParams = []) => {
  if (manifest.isDirectory && (manifest.name === 'root' || manifest.name === '/')) {
    throw new Error('Not permitted to update root directory');
  };
  const hasUnpermittedAttr = Object.keys(body).some(attr => !permittedParams.includes(attr));

  if (hasUnpermittedAttr) {
    throw new Error('Attempting to update a locked field');
  }

  return body;
}

const updateController = (req, res) => (async () => {
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

  const updateParams = validateBody(req.body, manifest, basePermittedUpdateAttributes);
  const recordsArray = [];

  Object.keys(updateParams).forEach(attr => {
    // first check if it's a rawAttribute
    if (attr === 'parentId') return;
    manifest.setDataValue(attr, updateParams[attr]);
  });

  let doBulkUpdate = false
  let pathArray, newParent;

  if (updateParams.parentId) {
    newParent = await Manifest.findOne({
      where: {
        id: updateParams.parentId,
      }
    });
    if (newParent) {
      pathArray = newParent.pathArray;
      await manifest.setParent(newParent);
    }
  }

  if (updateParams.name || newParent) {
    doBulkUpdate = true;
    if (!pathArray) {
      pathArray = manifest.pathArray;
      pathArray.pop();
    };

    updateTree(manifest, recordsArray, pathArray);
  }

  if (doBulkUpdate) {
    const updatedManifests = await Manifest.bulkCreate(recordsArray, {
      updateOnDuplicate: [...basePermittedUpdateAttributes, 'fullPath'],
      returning: true,
      hooks: false,
    });

    updatedManifests.map(updatedManifest => notificationsHelper(updatedManifest.userId, updatedManifest, 'update'))
  }

  const updatedManifest = await manifest.reload();

  return res.status(200).send(manifestSerializer(updatedManifest));
})().catch(console.error);

module.exports = updateController;
