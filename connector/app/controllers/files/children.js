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

  const hierarchyCache = responseData.included.reduce((acc, includedManifest) => {
    const isParent = manifestData.relationships.parents.data.some(parent => includedManifest.id === parent.id );
    const isDirectChild = manifestData.relationships.children.data.some(child => includedManifest.id === child.id );

    if (isParent) acc.parents[includedManifest.attributes.level] = includedManifest;
    if (isDirectChild) acc.directChildren.push(includedManifest);

    return acc;
  }, {
    parents: [],
    directChildren: [],
  });

  const parentHierarchy = hierarchyCache.parents;

  const getData = (manifest, hierarchy) => {
    const parents = hierarchy.slice(0);
    const ancestors = hierarchy.reduce((acc, parent) => {
      const current = parents.shift();

      if (current) acc = acc.concat( getData(current, parents) );

      return acc
    }, []);
    return manifestSerializer(manifest, ancestors);
  };

  const items = hierarchyCache.directChildren.map(child => getData(child, [manifestData, ...parentHierarchy]));

  return sendType(res, 200, { items }, {});
})().catch(err => console.error(err) && next(err));

module.exports = controller;
