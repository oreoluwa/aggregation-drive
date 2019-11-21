const httpClient = require('helpers/client');
const manifestSerializer = require('serializers/manifestSerializer');
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

  const parentHierarchy = responseData.included.reduce((acc, includedManifest) => {
    const isParent = manifestData.relationships.parents.data.some(parent => includedManifest.id === parent.id );
    if (isParent) acc[includedManifest.attributes.level] = includedManifest;

    return acc;
  }, []).filter(p => p).reverse();

  const getData = (manifest, hierarchy) => {
    const parents = hierarchy.slice(0);

    const ancestors = hierarchy.map(parent => {
      const current = parents.shift();
      return getData(current, parents);
    });

    return manifestSerializer(manifest, ancestors);
  };

  const data = getData(responseData.data, parentHierarchy);

  return sendType(res, 200, data, {});
})().catch(err => console.error(err) && next(err));

module.exports = controller;
