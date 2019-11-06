const path = require('path');
const { createFsFromVolume, Volume } = require('memfs');

const userFs = (files, mountPath) => {
  const vol = new Volume();
  const fs = createFsFromVolume(vol);

  return {
    dirStructure: (dirName) => dirTree(fs, dirName),
    userFiles: constructDirStructure(vol, files, mountPath),
    vol,
    fs,
  };
};

const dirTree = (fs, filename) => {
  const stats = fs.lstatSync(filename);
  const info = {
    path: filename,
    name: path.basename(filename),
  };
  if (stats.isDirectory()) {
    info.type = 'folder';
    info.children = fs.readdirSync(filename).map((child) => {
      const dirName = (filename + '/' + child).replace('//', '/');
      return dirTree(fs, dirName);
    });
  } else {
    info.type = 'file';
  }

  return info;
};

const constructDirStructure = (vol, files, pathPrefix) => {
  const fileJson = files.reduce((acc, fileDetail) => {
    acc[ fileDetail.originalname ] = JSON.stringify(fileDetail);
    return acc;
  }, {});

  const mountPath = pathPrefix || '/';
  vol.fromJSON(fileJson, mountPath);

  return fileJson;
};

module.exports = {
  userFs,
};
