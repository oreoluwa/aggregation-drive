const base64Url = require('base64-url');
const qs = require('querystring');
const deepExtend = require('deep-extend');

const getManifest = async(httpClient, path) => {
  const encodedPath = base64Url.encode(path);
  const response = await httpClient.get(`manifest/${encodedPath}`, {
    params: {
      include: 'children',
    },
    paramsSerializer: (params) => qs.stringify(params, {
      arrayFormat: 'repeat'
    }),
  });

  return response.data;
};

const cacheHandler = (cache, httpClient) => {
  const descriptorMap = [];
  const idMap = new Map();

  const addManifest = (manifest, meta) => {
    const manifestId = manifest.id;
    const manifestPath = `/${ manifest.attributes.path }`;

    if (meta) {
      if (!manifest.attributes.size) delete manifest.attributes.size;
      if (!manifest.relationships.children) delete manifest.relationships.children;

      switch(meta.action) {
        case 'destroy': {
          if (!manifest.attributes.deletedAt) manifest.attributes.deletedAt = new Date();
          break;
        }
        case 'update':
        case 'create':
        default: {

        }
      }
      const oldValue = cache.get(manifestPath) || {};
      manifest = deepExtend(oldValue, manifest);
    };

    cache.set(manifestPath, manifest);

    ['r', 'w', 'r+'].forEach(fMode => {
      const ref = manifest.id + ':' + fMode;
      const fd = descriptorMap.indexOf(ref);
      if (fd !== -1) return;
      descriptorMap.push(ref);
    });

    if (idMap.has(manifestId)) {
      // find a way to delete old paths from the cache.
      const currentPath = idMap.get(manifestId);
      // cache.delete
      // if (!idMap.has(manifestId)) idMap.set(manifestId, manifestPath);

    }
    idMap.set(manifestId, manifestPath);

    return manifest;
  };

  const findByPath = async (path) => {
    let manifest = cache.get(path);
    if (!manifest) {
      const responseData = await getManifest(httpClient, path);
      manifest = addManifest(responseData.data);
      if (responseData.included) responseData.included.map(addManifest);
    };

    return !manifest.attributes.deletedAt && manifest;
  }

  const findById = (id) => {
    const manifestPath = idMap.get(id);
    return findByPath(manifestPath);
  }

  const findByFileDescriptor = (fd) => {
    const descriptor = descriptorMap[fd];
    if (!descriptor) return;

    const [ fileId, mode ] = descriptor.split(':');

    return findById(fileId);
  }

  const getFileDescriptor = async (path, mode) => {
    const manifest = await findByPath(path);
    if (!manifest) return;
    const ref = manifest.id + ':' + mode;
    return descriptorMap.indexOf(ref);
  }

  return {
    addManifest,
    findById,
    findByPath,
    findByFileDescriptor,
    getFileDescriptor,
    httpClient,
  }
};

module.exports = cacheHandler;
