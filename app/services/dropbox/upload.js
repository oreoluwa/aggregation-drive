const uploadToDrive = async (client, identity, manifest, stream) => {
  const { folderId, folderName } = identity;

  const file = await client({
    resource: 'files/upload',
    parameters: {
      path: `/${ folderName }/${ manifest.digest }`,
      autorename: false,
      mode: 'overwrite',
    },
    readStream: stream,
  });

  manifest.providerManifestId = file.id;

  return file;
}

module.exports = uploadToDrive;
