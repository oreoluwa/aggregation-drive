const downloadFromDrive = async (client, folderId, folderName, documentId, digest) => {
  const readableStream = await client.files.get({
    fileId: documentId,
    alt: 'media',
  }, {
    responseType: 'stream'
  });

  return readableStream.data;
};

module.exports = downloadFromDrive;
