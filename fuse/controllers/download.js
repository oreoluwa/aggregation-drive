const { debugPrefix } = require('../package.json');
const debug = require('debug')(debugPrefix + ':proxyServer:downloadController');

const {
  PassThrough
} = require('stream');
const sendResponse = require('@polka/send-type');

const prepareResponse = (headers) => {
  const baseHeaders = {
    'Accept-Ranges': 'bytes'
  }

  if (headers) baseHeaders['Content-Type'] = headers['Content-Type'] || headers['content-type'];

  return (res, buffer, newHeaders, range) => {
    const { start, end } = range;
    const chunkSize = end - start;
    const data = buffer.slice(start, end);

    const head = {
      ...baseHeaders,
      ...newHeaders,
      'Content-Range': `bytes ${start}-${end}/${chunkSize}`,
      'Content-Length': chunkSize,
    };

    debug.extend('preparedResponse')(JSON.stringify(head));

    sendResponse(res, 206, data, head);
  };
};

const downloadController = (req, res, next) => (async () => {
  const fileId = req.params.fileId;
  const cacheId = `__downloads_${ fileId }`;

  let responseCache = req.proxyServer.cache.get(cacheId) || {};
  let {
    response,
    headers,
    pending,
  } = responseCache;

  const contentRangeStr = req.headers.range;

  if (!contentRangeStr) {
    const downloadResponse = await req.proxyServer.axiosInstance.get(`download/${fileId}`, {
      responseType: 'stream',
    });

    res.writeHead(downloadResponse.status, downloadResponse.headers);

    return downloadResponse.data.pipe(res);
  };

  let [ rangeStart, rangeEnd ] = contentRangeStr.replace(/bytes=/, "").split("-");
  rangeStart = Number.parseInt(rangeStart);
  rangeEnd = Number.parseInt(rangeEnd);

  debug.extend('startRange')(rangeStart);
  debug.extend('rangeEnd')(rangeEnd);

  let responseHandler = prepareResponse(headers);
  if (!response) {
    const downloadResponse = await req.proxyServer.axiosInstance.get(`download/${fileId}`, {
      responseType: 'stream'
    });

    responseCache.headers = downloadResponse.headers;
    responseCache.pending = true;

    const stream = new PassThrough();

    stream.on('data', (chunk) => {
      const startTime = +new Date();
      responseCache.response = responseCache.response ? Buffer.concat([responseCache.response, chunk]) : chunk;
      const total = +new Date() - startTime;

      debug.extend('concatTime')(`${total / 1000 }s`);
      debug.extend('bufferLength')(responseCache.response.length);
      req.proxyServer.cache.set(cacheId, responseCache);
    });

    stream.on('end', () => {
      responseCache.pending = false;

      req.proxyServer.cache.set(cacheId, responseCache);
    });

    downloadResponse.data.pipe(stream);
  };

  const totalFileSize = parseInt(responseCache.headers['content-length']);

  let range = {
    start: Number.isNaN(rangeStart) ? 0 : Math.max(rangeStart, 0),
    end:   Number.isNaN(rangeEnd) ? totalFileSize : Math.min(Math.max(rangeEnd, 0), totalFileSize),
  };

  if (rangeStart < 0 || rangeStart > rangeEnd) {
    throw new Error(`Invalid value. Object[ Range { start: ${rangeStart}, end: ${rangeEnd}, total: ${totalFileSize} } ]`);
  }

  if (!Number.isNaN(rangeStart) && Number.isNaN(rangeEnd)) {
    debug.extend('range')("End is not provided.");

    range.start = rangeStart;
    range.end = totalFileSize;
  }

  if (Number.isNaN(rangeStart) && !Number.isNaN(rangeEnd)) {
    debug.extend('range')(`Start is not provided, "end" will be treated as last "end" bytes of the content.`);

    range.start = Math.max(totalFileSize - rangeEnd, 0);
    range.end = totalFileSize;
  };

  const effectiveContentLength = range.end;
  debug.extend('responseHeaders')(JSON.stringify(responseCache.headers));
  debug.extend('effectiveContentLength')(effectiveContentLength);


  function checkBufferAndSendResponse () {
    const bufferCache = responseCache.response;
    if (bufferCache && effectiveContentLength <= bufferCache.length) {
      return responseHandler(res, bufferCache, {}, range);
    };

    // Retry.
    debug.extend('checkBufferAndSendResponse:retry:rangeEnd')(rangeEnd);
    debug.extend('checkBufferAndSendResponse:retry:effectiveContentLength')(effectiveContentLength);
    bufferCache && debug.extend('checkBufferAndSendResponse:retry:bufferLength')(bufferCache.length);
    return setImmediate(checkBufferAndSendResponse)
  };

  return checkBufferAndSendResponse();
})().catch(next);

module.exports = downloadController;
