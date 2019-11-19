const sendResponse = require('@polka/send-type');
const cacheHandler = require('helpers/cache');

const webhookController = (req, res, next) => (async () => {
  // console.log(req.body)

  const cacheAgent = cacheHandler(cache, {});
  // const manifestData = req.body.data;
  const webhookData = req.body;
  const webhookDataType = webhookData.data.type;
  if ( !['files', 'folders'].includes(webhookDataType) ) return sendResponse(res, 204, {}, {});

  cacheAgent.addManifest(webhookData.data, { action: webhookData.meta.trigger });

  sendResponse(res, 204, webhookData.data, {});
})().catch(next);

module.exports = webhookController;
