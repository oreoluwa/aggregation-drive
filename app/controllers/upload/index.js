const { userFs } = require('utils/userFs');
const uploadService = require('services/uploader')

const uploadController = (req, res) => (async () => {
  const { files } = req;

  const userFakeFs = userFs(files);

  await uploadService(req, userFakeFs);
  const dirStructure = userFakeFs.dirStructure('/');

  return res.status(200).send(dirStructure);
})().catch(console.error);

module.exports = uploadController;
