const path = require('path');
const {
  ROOT_PREFIX_REGEX,
} = require('config/components/variables');

const manifestSerializer = ({
  id,
  name,
  pathArray,
  fullPath,
  mimeType,
  size,
  createdAt,
  updatedAt,
  isDirectory,
  provider,
  providerManifestId,
  userId,
  children,
  ancestors,
  parentId,
  hierarchyLevel,
  digest,
}, overrideAttrs = {}) => {
  const fileType = isDirectory ? 'folders' : 'files';

  let pathName;
  if (pathArray) {
    pathArray.shift();
    pathName = path.join(...pathArray);
  } else if (fullPath) {
    pathName = fullPath.replace(ROOT_PREFIX_REGEX, '');
  }

  let childrenMap;
  if (children && fileType !== 'files') {
    childrenMap = {
      data: children.map(child => ({
        type: 'children',
        id: child.id,
      }))
    };
  }

  let parentMap;
  if (ancestors) {
    parentMap = {
      data: ancestors.map(parent => ({
        type: 'parents',
        id: parent.id,
      }))
    };
  }

  let parent;
  if (parentId) {
    parent = {
      data: {
        id: parentId,
        type: 'parent',
      }
    }
  }

  let fileDigest, providerInfo, mimeTypeInfo;
  if (!isDirectory) {
    providerInfo = {
      data: {
        id: providerManifestId,
        type: provider,
      }
    };
    fileDigest = digest;
    mimeTypeInfo = mimeType;
  }

  return ({
    id,
    type: fileType,
    attributes: {
      name,
      path: pathName,
      mimeType: mimeTypeInfo,
      size,
      createdAt,
      updatedAt,
      level: hierarchyLevel,
      digest: fileDigest,
      ...overrideAttrs,
    },
    relationships: {
      provider: providerInfo,
      user: {
        data: {
          id: userId,
          type: 'users',
        }
      },
      parent,
      children: childrenMap,
      parents: parentMap,
    },
  });
}

module.exports = manifestSerializer;
