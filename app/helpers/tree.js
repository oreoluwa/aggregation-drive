const Models = require('models').initializeModels();
const Directory = Models.directoryManifest;
const Manifest = Models.manifest;
const util = require('util');

const buildRootNode = async (userId) => {
  const rootScope = { userId, fullPath: '/'};

  const [ rootNode, isCreated ] = await Directory.findOrCreate({
    where: rootScope,
    defaults: rootScope,
  });

  return rootNode;
}

const logggg = (...args) => console.log('==> ==> => ->', util.inspect(args, false, null, true));

const buildDBTree = async (userId, dirTree, parentId=null) => {
  const buildTree = dirTree || {};
  const isDirectory = dirTree.type === 'folder';
  const isFile = dirTree.type === 'file';
  const isRootNode = dirTree.path === '/';
  const hasNode = isRootNode || parentId;
  const scope = hasNode && (isRootNode && { fullPath: dirTree.path }) || { id: parentId };

  const parent = !hasNode ? { id: null } : (await Directory.findOne(
    {
      where: {
        userId,
        ...scope,
      }

    }
  ));

  const defaultParams = {
    fullPath: dirTree.path,
    name: dirTree.name,
    parentId: parent.id || null,
    userId: userId,
  }

  let self, isCreated;
  if (isFile) {
    [self, isCreated] = await Manifest.findOrCreate({
      where: defaultParams,
      defaults: {
        ...defaultParams,
        // ...put other meta data here
        metadata: dirTree.content,
        digest: dirTree.digest,
        mimeType: dirTree.mimeType,
        size: dirTree.size,
      },
    });
    // handle replacing file content
    // self.update({})
  } else if (!isRootNode && isDirectory) {
    [self, isCreated] = await Directory.findOrCreate({
      where: defaultParams,
      defaults: defaultParams,
    })

  } else if(isRootNode) {
    self = parent;
  };

  buildTree.self = self;

  if (isFile) return buildTree;

  if (
    isDirectory &&
    !dirTree.children ||
    !Array.isArray(dirTree.children) ||
    !dirTree.children.length
  ) {
    return buildTree;
  };

  const children = await dirTree.children.reduce(async (asyncChildren, child) => {
    const resolvedChildren = await asyncChildren;
    child.self = (await buildDBTree(userId, child, self.id)).self;

    return resolvedChildren.concat(child);
  }, Promise.resolve([]));

  buildTree.children = children;

  return buildTree;
}

const extractManifestsFromTree = (tree) => {
  const manifests = [];

  (function walkTree (tree, manifests) {
    const isFile = tree.type === 'file';
    const isFolder = tree.type === 'folder';

    if (isFile) {
      manifests.push(tree.self);
    } else { // isFolder
      tree.children.forEach(child => walkTree(child, manifests))
    };
  })(tree, manifests);

  return manifests
}

module.exports = {
  buildDBTree,
  extractManifestsFromTree,
}
