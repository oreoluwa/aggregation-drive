const { PassThrough } = require('stream');
const stream = new PassThrough();

const downloadFromDrive = async (client, folderId, folderName, documentId, digest) => {
  const readableStream = await client.files.getReadStream(documentId);

  return readableStream.pipe(stream);
};

module.exports = downloadFromDrive;
