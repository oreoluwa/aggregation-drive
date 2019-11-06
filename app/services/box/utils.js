const getOrcreateStorageFolder = async (client, identity) => {
  const { folderId, folderName } = identity

  if (folderId) {
    return client.folders.get(folderId)
  }

  const folder = await client.folders.create('0', folderName);
  await identity.update({
    folderId: folder.id,
  });

  return folder;
}

module.exports = {
  getOrcreateStorageFolder,
}
