// const uploadToDrive = async (client, identity, manifest, stream) => {
//   const { folderId, folderName } = identity;
//
//   const file = await client({
//     resource: 'files/upload',
//     parameters: {
//       path: `/${ folderName }/${ manifest.digest }`,
//       autorename: false,
//       mode: 'overwrite',
//     },
//     readStream: stream,
//   });
//
//   manifest.providerManifestId = file.id;
//
//   return file;
// }

const uploadToDrive = async (client, folderId, folderName, digest, stream) => {

  const file = await client({
    resource: 'files/upload',
    parameters: {
      path: `/${ folderName }/${ digest }`,
      autorename: false,
      mode: 'overwrite',
    },
    readStream: stream,
  });

  return file.id;
}

module.exports = uploadToDrive;
