// const uploadToDrive = async (client, identity, manifest, stream) => {
//   const { folderId } = identity;
//
//   const file = await client.files.uploadFile(folderId, manifest.digest, stream);
//   manifest.providerManifestId = file.entries[0].id;
//
//   return file;
// }

const onTheFlyDiskBuffer = require('helpers/onTheFlyDiskBuffer');

const uploadToDrive = async (client, folderId, folderName, digest, stream, fileId) => {
  const boxFileId = await new Promise((resolve, reject) => {
    return onTheFlyDiskBuffer(stream, digest, async (err, fStream) => {
      if (err) return reject(err);

      let file;
      if (!fileId) {
        file = await client.files.uploadFile(folderId, digest, fStream);
      } else {
        file = await client.files.uploadNewFileVersion(fileId, fStream);
      };

      resolve(file.entries[0].id);

    });
  });

  return boxFileId;
}

module.exports = uploadToDrive;
