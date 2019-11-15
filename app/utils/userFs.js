const path = require('path');
const { createFsFromVolume, Volume } = require('memfs');

const userFs = (files, mountPath) => {
  const vol = new Volume();
  const fs = createFsFromVolume(vol);

  const fileInfo = constructDirectoryMap(vol, files, mountPath);
  return {
    dirStructure: (dirName) => dirTree(fs, dirName, fileInfo.manifestMap),
    userFiles: fileInfo.fileJson,
    vol,
    fs,
  };
};

const dirTree = (fs, filename, manifestMap) => {
  const stats = fs.lstatSync(filename);
  const info = {
    path: filename,
    name: path.basename(filename),
  };

  if (stats.isDirectory()) {
    info.type = 'folder';
    info.children = fs.readdirSync(filename).map((child) => {
      const dirName = path.join(filename, child);
      return dirTree(fs, dirName, manifestMap);
    });
  } else {
    const fileDetail = manifestMap[filename];
    info.type = 'file';
    info.content = fileDetail;
    info.digest = fileDetail.filename;
    info.mimeType = fileDetail.mimetype;
    info.size = fileDetail.size;
    info.provider = fileDetail.provider;
    info.providerManifestId = fileDetail.providerManifestId;
  }

  return info;
};

const constructDirectoryMap = (vol, files, pathPrefix) => {
  const mountPath = pathPrefix || '/root';
  const manifestMap = {};

  const fileJson = files.reduce((acc, fileDetail) => {
    acc[ fileDetail.originalname ] = JSON.stringify(fileDetail);
    manifestMap[ path.join(mountPath, fileDetail.originalname) ] = fileDetail;
    return acc;
  }, {});

  vol.fromJSON(fileJson, mountPath);

  return {
    fileJson,
    manifestMap,
  };
};

module.exports = {
  userFs,
};
