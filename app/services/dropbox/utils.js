const promisify = require('util').promisify;

const getOrcreateStorageFolder = async (client, identity) => {
  const { folderId, folderName } = identity

  if (folderId) {
    return client({
      resource: 'files/get_metadata',
      parameters: {
        path: folderId,
        include_media_info: true,
        include_deleted: false,
        include_has_explicit_shared_members: false,
      },
    })
  }

  const folder = await client({
    resource: 'files/create_folder',
    parameters: {
      path: '/' + folderName,
      autorename: true,
    }
  });

  await identity.update({
    folderId: folder.metadata.id,
  });

  return folder;
}

module.exports = {
  getOrcreateStorageFolder,
}
