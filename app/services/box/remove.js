const removeFromDrive = async (client, documentId) => {
  const file = await client.files.delete(documentId);

  return file;
}

module.exports = removeFromDrive;
