const removeFromDrive = async (client, documentId ) => {
  const file = client.files.delete({
    fileId: documentId,
  });

  return file;
}

module.exports = removeFromDrive;
