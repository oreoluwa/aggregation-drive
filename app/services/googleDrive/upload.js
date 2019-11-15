// const uploadToDrive = async (client, identity, manifest, stream) => {
//   const { folderId, folderName } = identity;
//
//   const file = await client.files.create({
//     resource: {
//       name: manifest.digest,
//       parents: [folderId],
//     },
//     media: {
//       body: stream,
//     },
//     fields: 'id',
//   });
//
//   manifest.providerManifestId = file.data.id;
//
//   return file;
// }

const uploadToDrive = async (client, folderId, folderName, digest, stream, fileId) => {
  let file;
  if (!fileId) {
    file = await client.files.create({
      resource: {
        name: digest,
        parents: [folderId],
      },
      media: {
        body: stream,
      },
      fields: 'id',
    });
  } else {
    file = await client.files.update({
      uploadType: 'media',
      fileId,
      media: {
    		body: stream
    	}
    });
  }

  return file.data.id;
}

module.exports = uploadToDrive;
