const getOrcreateStorageFolder = async (client, identity) => {
  const { folderId, folderName } = identity;

  if (folderId) {
    return client.files.get({
      fileId: folderId,
      fields: 'parents',
    });
  };

  const folder = await client.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  await identity.update({
    folderId: folder.data.id,
  });

  return folder;
}

module.exports = {
  getOrcreateStorageFolder,
}
