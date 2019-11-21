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
      children: childrenMap,
    },
  });
}

module.exports = manifestSerializer;
