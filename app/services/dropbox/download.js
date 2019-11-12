const downloadFromDrive = async (client, folderId, folderName, documentId, digest) => {
  const readableStream = await client({
    resource: 'files/download',
    parameters: {
      path: folderId,
    },
  });

  return readableStream;
};

module.exports = downloadFromDrive;
