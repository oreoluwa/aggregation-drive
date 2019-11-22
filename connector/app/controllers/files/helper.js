const manifestSerializer = require('serializers/manifestSerializer');

const buildHierarchyCache = (manifestData, included) => {
  const hierarchyCache = included.reduce((acc, includedManifest) => {
    const isParent = (
      manifestData.relationships.parents &&
      manifestData.relationships.parents.data.some(parent => includedManifest.id === parent.id )
    );
    const isDirectChild = (
      manifestData.relationships.children &&
      manifestData.relationships.children.data.some(child => includedManifest.id === child.id )
    );

    if (isParent) acc.parents[includedManifest.attributes.level] = includedManifest;
    if (isDirectChild) acc.directChildren.push(includedManifest);

    return acc;
  }, {
    parents: [],
    directChildren: [],
  });

  hierarchyCache.parents = hierarchyCache.parents.filter(p => p);
  hierarchyCache.directChildren = hierarchyCache.directChildren.filter(c => c);

  return hierarchyCache;
}

const getData = (manifest, hierarchy) => {
  const parents = hierarchy.slice(0);
  const ancestors = hierarchy.reduce((acc, parent) => {
    const current = parents.pop();

    if (current) acc = acc.concat( getData(current, parents) );

    return acc
  }, []);
  return manifestSerializer(manifest, ancestors);
};

module.exports = {
  buildHierarchyCache,
  getData,
}
