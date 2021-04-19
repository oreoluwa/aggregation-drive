const manifestSerializer = (manifest, ancestor) => {
  const manifestAttributes = manifest.attributes;
  let ancestors = [];
  if ((Array.isArray(ancestor) && ancestor.length)) ancestors = ancestors.concat(ancestor);

  return {
    id: manifest.id,
    name: manifestAttributes.name,
    createdTime: manifestAttributes.createdAt,
    modifiedTime: manifestAttributes.updatedAt,
    // need to implement capabilities
    capabilities: {
      canDelete: false,
      canRename: false,
      canCopy: false,
      canEdit: false,
      canDownload: true,
      canListChildren: true,
      canAddChildren: true,
      canRemoveChildren: true,
    },
    parentId: (manifest.relationships.parent && manifest.relationships.parent.data && manifest.relationships.parent.data.id),
    size: manifestAttributes.size,
    type: manifest.type === 'folders' ? 'dir' : 'file',
    ancestors,
  };
};

module.exports = manifestSerializer;
