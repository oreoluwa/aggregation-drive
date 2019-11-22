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
        include: ['parents', 'children'],
      },
    },
  });

  const responseData = response.data;
  if (!(response.status >= 200 && response.status < 300)) {
    return sendType(res, 410, responseData, {});
  };

  const manifestData = responseData.data;
  if (manifestData.type === 'files') {
    return sendType(res, 410, {
      errors: [{
        status: 410,
        title: 'NOT_SUPPORTED',
        detail: 'Cannot get children of a file'
      }]
    }, {});
  };

  const hierarchyCache = buildHierarchyCache(manifestData, responseData.included);

  const parentHierarchy = hierarchyCache.parents;

  let items = hierarchyCache.directChildren.map(child => getData(child, [...parentHierarchy, manifestData]));
  if (req.query.orderBy) {
    const { orderBy, orderDirection } = req.query;
    const precedenceValue = (orderDirection === 'ASC') ? -1 : 1;
    items = items.sort((a, b) => (a[orderBy] > b[orderBy]) ? -precedenceValue : precedenceValue );
  }

  return sendType(res, 200, { items }, {});
})().catch(err => console.error(err) && next(err));

module.exports = controller;
