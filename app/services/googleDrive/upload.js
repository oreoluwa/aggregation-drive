const uploadToDrive = async (client, identity, manifest, stream) => {
  const { folderId, folderName } = identity;

  const file = await client.files.create({
    resource: {
      name: manifest.digest,
      parents: [folderId],
    },
    media: {
      body: stream,
    },
    fields: 'id',
  });

  manifest.providerManifestId = file.data.id;

  return file;
}

module.exports = uploadToDrive;
