const httpClient = require('helpers/client');
const {
  buildHierarchyCache,
  getData,
} = require('./helper');
const util = require('util');
const sendType = require('@polka/send-type');
const SHOW_ENDPOINT = 'manifest/%s'

const controller = (req, res, next) => ( async () => {
  const endpoint = util.format(SHOW_ENDPOINT, req.fileId);
  const response = await httpClient.get({
    endpoint,
    config: {
      params: {
        include: 'parents',
      },
    },
  });

  const responseData = response.data;
  if (!(response.status >= 200 && response.status < 300)) {
    return sendType(res, 410, responseData, {});
  };

  const manifestData = responseData.data;

  const hierarchyCache = buildHierarchyCache(manifestData, responseData.included);

  const parentHierarchy = hierarchyCache.parents;

  const data = getData(responseData.data, parentHierarchy);

  return sendType(res, 200, data, {});
})().catch(err => console.error(err) && next(err));

module.exports = controller;
