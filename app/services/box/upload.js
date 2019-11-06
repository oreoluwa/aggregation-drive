const uploadToDrive = async (client, identity, manifest, stream) => {
  const { folderId } = identity;

  const file = await client.files.uploadFile(folderId, manifest.digest, stream);
  manifest.providerManifestId = file.entries[0].id;

  return file;
}

module.exports = uploadToDrive;
