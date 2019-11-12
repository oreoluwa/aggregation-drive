const removeFromDrive = async (client, documentId) => {

  const file = await client({
    resource: 'files/delete',
    parameters: {
      path: documentId,
    }
  });

  return file;
}

module.exports = removeFromDrive;
