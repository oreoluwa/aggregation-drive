const downloadFromDrive = async (client, folderId, folderName, documentId, digest) => {
  const readableStream = await client({
    resource: 'files/download',
    parameters: {
      path: documentId,
    },
  });

  return readableStream;
};

module.exports = downloadFromDrive;
