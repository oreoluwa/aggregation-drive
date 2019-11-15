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

        if (!sentFirstByte && maxRange && (maxRange < buffer.length)) {
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
})().catch(console.error);



// stream.end(data);

    // res.writeHead(206, head);

    // const stream = new PassThrough();
    // stream.pipe(res);

    // console.log('===>', head);


    // console.log('====>>>', data.toString('utf8'))
    // stream.on('data', console.log);


// const end = maxRange ? parseInt(maxRange, 10) : (response.length - 1);
// const chunkSize = (end - start) + 1;
//
// const content = response.slice(start, end);
//
// const head = {
//   'Content-Range': `bytes ${start}-${end}/${chunkSize}`,
//   'Accept-Ranges': 'bytes',
//   'Content-Length': chunkSize,
//   // 'Content-Type': 'video/mp4',
// }
// res.writeHead(206, head);
//
// const stream = new PassThrough();
//
// stream.end(content);
//
// stream.pipe(res);

// const response = await req.proxyServer.axiosInstance.get(`download/${req.param.fileId}`, {
//   responseType: 'stream'
// });
// return response.data;





// var end = partialend ? parseInt(partialend, 10) : total-1;
// var chunksize = (end-start)+1;
// console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
//
// var file = fs.createReadStream(path, {start: start, end: end});
// res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
// file.pipe(res);


module.exports = downloadController;
