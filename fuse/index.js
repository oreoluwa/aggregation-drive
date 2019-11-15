const fuse = require('fuse-bindings');
const base64Url = require('base64-url');
const axios = require('axios');
const qs = require('querystring');
const Server = require('./server');
const {
  PassThrough
} = require('stream');

const ENOENT = -2;
const EPERM = -1;

const mountPath = process.platform !== 'win32' ? './mnt' : 'M:\\'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  // baseURL: 'http://host.docker.internal:3001',
  timeout: 30000,
  // responseType: 'blob',
  // headers: {'X-Custom-Header': 'foobar'}
});

const getPath = async (path) => {
  const encodedPath = base64Url.encode(path);
  const response = await axiosInstance.get(`manifest/${encodedPath}`, {
    params: {
      include: 'children',
    },
    paramsSerializer: (params) => qs.stringify(params, {
      arrayFormat: 'repeat'
    }),
  });

  return response.data;
}

const getContentReadStream = async (path) => {
  // const response = await axiosInstance.get(`download/${path}`, {
  //   // responseType: 'stream'
  // });
  // return response.data;
}

const mapPathIdToPath = (responseData) => {
  const allResponses = {};
  const {
    data,
    included
  } = responseData;
  allResponses[data.id] = data;

  return included.reduce((acc, manifest) => {
    acc[manifest.id] = manifest;
    return acc;
  }, allResponses);
}

const getChildrenNames = (responseData) => {
  const {
    data
  } = responseData;
  let children = [];
  if (data.relationships && data.relationships.children) {
    const cacheRecord = mapPathIdToPath(responseData);
    children = data.relationships.children.data.map(child => cacheRecord[child.id].attributes.name);
  }
  return children;
}

const descriptorMapping = () => {
  const fileIdMapping = [];

  return {
    descriptorByFileId: (fileId) => {
      let fd = fileIdMapping.indexOf(fileId);
      if (fd !== -1) {
        return fd;
      };

      fileIdMapping.push(fileId);
      fd = fileIdMapping.length - 1;
      return fd;
    },
    fileIdBydescriptor: (fd) => {
      return fileIdMapping[fd];
    }
  }
}

const fileDescriptor = descriptorMapping();

const getPathInfo = (responseData) => {
  const {
    data
  } = responseData;
  const uid = process.getuid ? process.getuid() : 0;
  const gid = process.getgid ? process.getgid() : 0;
  const mode = data.type === 'folders' ? 16877 : 33206;
  // const mode = data.type === 'folders' ? 16877 : 33188;

  return {
    mtime: new Date(data.attributes.updatedAt),
    atime: new Date(),
    ctime: new Date(data.attributes.createdAt),
    nlink: 1,
    size: data.attributes.size,
    mode,
    uid,
    gid,
  }
}

Server.start().then(() => {
  fuse.mount(mountPath, {
    readdir: async (path, cb) => {
      console.log('readdir(%s)', path);

      const pathResponse = await getPath(path);
      const children = getChildrenNames(pathResponse);
      return cb(0, children);

      // handle failure situations
    },
    getattr: async (path, cb) => {
      console.log('getattr(%s)', path)

      const pathResponse = await getPath(path);
      const pathInfo = getPathInfo(pathResponse);

      return cb(0, pathInfo);

      // handle failure situations

      cb(fuse.ENOENT)
    },
    open: async (path, flags, cb) => {
      console.log('open(%s, %d)', path, flags);

      const {
        data
      } = await getPath(path);
      const fd = fileDescriptor.descriptorByFileId(data.id);

      cb(0, fd);
    },

    read: async (path, fd, buf, len, pos, cb) => {
      console.log('read(%s, %d, %d, %d)', path, fd, len, pos)

      const fileId = fileDescriptor.fileIdBydescriptor(fd);
      const {
        data
      } = await getPath(path);
      // const id = data.id;
      // const size = data.attributes.size;

      const range = `${pos}-${pos + len - 1}`

      const axiosResponse = await axiosInstance.get(`download/${fileId}`, {
        responseType: 'stream',
        headers: {
          'Range': `bytes=${range}`
        }
      });

      const contentLength = axiosResponse.headers['content-length'];

      const stream = new PassThrough();
      axiosResponse.data.pipe(stream);

      stream.on('data', chunk => {
        buf.write(chunk.toString('utf8'));
      });





      // const loop

      // pos + '-' + (pos + len - 1)
      // var contentLength
      // const readableStream = await getContentReadStream(fileId);
      // readableStream.pipe(buf);


      // const str = 'hello world\n'.slice(pos, pos + len);

      // if (!str) return cb(0)
      // buf.write(str)
      // return cb(str.length)


      return cb(contentLength);
    }

  }, function(err) {
    if (err) throw err
    console.log('filesystem mounted on ' + mountPath)
  })

  process.on('SIGINT', function() {
    fuse.unmount(mountPath, function(err) {
      if (err) {
        console.log('filesystem at ' + mountPath + ' not unmounted', err)
      } else {
        console.log('filesystem at ' + mountPath + ' unmounted')
      }
    })
  })
})
