// const uploadToDrive = async (client, identity, manifest, stream) => {
//   const { folderId } = identity;
//
//   const file = await client.files.uploadFile(folderId, manifest.digest, stream);
//   manifest.providerManifestId = file.entries[0].id;
//
//   return file;
// }

const uploadToDrive = async (client, folderId, folderName, digest, stream) => {

  const file = await client.files.uploadFile(folderId, digest, stream);

  return file.entries[0].id;
}

module.exports = uploadToDrive;
