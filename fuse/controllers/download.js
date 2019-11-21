const { debugPrefix } = require('../package.json');
const debug = require('debug')(debugPrefix + ':proxyServer');

const {
  PassThrough
} = require('stream');
const sendResponse = require('@polka/send-type');

const prepareResponse = (headers, start, maxRange) => {
  const baseHeaders = {
    'Accept-Ranges': 'bytes'
  }

  if (headers) baseHeaders['Content-Type'] = headers['Content-Type'] || headers['content-type'];

  return (res, buffer, newHeaders) => {
    const end = maxRange ? parseInt(maxRange, 10) : ((buffer.length) - 1);
    const chunkSize = (end - start) + 1;
    const data = buffer.slice(start, end);

    const head = {
      ...baseHeaders,
      ...newHeaders,
      'Content-Range': `bytes ${start}-${end}/${chunkSize}`,
      'Content-Length': chunkSize,
    };

    sendResponse(res, 206, data, head);
  };
};

const downloadController = (req, res, next) => (async () => {
  const fileId = req.params.fileId;
  const cacheId = `__download_${ fileId }`;

  let responseCache = req.proxyServer.cache.get(cacheId);
  let {
    response,
    headers,
    pending,
  } = responseCache ? responseCache : {};

  const contentRangeStr = req.headers.range;

  if (!contentRangeStr) {
    const downloadResponse = await req.proxyServer.axiosInstance.get(`download/${fileId}`, {
      responseType: 'stream'
    });

    res.writeHead(downloadResponse.status, downloadResponse.headers);

    return downloadResponse.data.pipe(res);
  };

  const [start, maxRange] = contentRangeStr.replace(/bytes=/, "").split("-");

  let sentFirstByte = false;
  let responseHandler = prepareResponse(headers, start, maxRange);
  if (!response) {
    [ headers, response ] = await new Promise(async (resolve) => {
      const downloadResponse = await req.proxyServer.axiosInstance.get(`download/${fileId}`, {
        responseType: 'stream'
      });
      const {
        headers
      } = downloadResponse;

      const responseCache = {
        headers,
        pending: true,
      };

      const stream = new PassThrough();
      let buffer;

      stream.on('data', (chunk) => {
        buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
        responseCache.response = buffer;

        req.proxyServer.cache.set(cacheId, responseCache);

        const maxUpstreamFileSize = parseInt(headers['content-length']);
        const effectiveContentLength = maxRange > maxUpstreamFileSize ? maxUpstreamFileSize : maxRange

        debug.extend('responseHeaders')(JSON.stringify(headers));
        debug.extend('maxRange')(maxRange);
        debug.extend('bufferLength')(buffer.length);
        debug.extend('effectiveContentLength')(effectiveContentLength);

        if (!sentFirstByte && effectiveContentLength && (effectiveContentLength <= buffer.length)) {
          sentFirstByte = true;
          return responseHandler(res, buffer, headers);
        };
      });

      stream.on('end', () => {
        resolve([headers, buffer]);
      });

      downloadResponse.data.pipe(stream);
    });

    req.proxyServer.cache.set(cacheId, {
      headers,
      response,
      pending: false,
    });

  } else if (pending) {
    if (maxRange < response.length) {
      return responseHandler(res, response, {});
    }
  } else {
    return responseHandler(res, response, {});
  }
})().catch(next);

module.exports = downloadController;
