const httpClient = require('helpers/client');
const util = require('util');
const archiver = require('archiver');
const DOWNLOAD_ENDPOINT = 'download/%s'

const controller = (req, res, next) => ( async () => {
  const getDownloadItemStream = (itemId) => {
    const endpoint = util.format(DOWNLOAD_ENDPOINT, itemId);
    return httpClient.get({
      endpoint,
      config: {
        responseType: 'stream',
      },
    });
  };

  const items = req.query.items;
  if (Array.isArray(items)) {
    const downloadResponses = await Promise.all(items.map(getDownloadItemStream));
    const readStream = archiver('zip', {
      gzip: true,
      zlib: {
        level: 9,
      },
    });
    readStream.pipe(res);
    const fileName = downloadResponses.reduce((downloadName, response) => {
      const contentDisposition = response.headers['content-disposition'];
      if (!contentDisposition) throw new Error('NO_CONTENT-DISPOSITION_ERROR');

      const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      if (matches && matches[1]) {
        const name = matches[1].replace(/['"]/g, '');
        readStream.append(response.data, { name });
        downloadName = downloadName + '-' + name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '_');
      };
      return downloadName;
    }, 'multiple');

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment;filename="${fileName}.zip"`,
    });

    return readStream.finalize();
  } else {
    const response = await getDownloadItemStream(items);
    const readStream = response.data;
    if (!(response.status >= 200 && response.status < 300)) {
      return sendType(res, 410, readStream, {});
    };
    res.writeHead(response.status, response.headers);

    return readStream.pipe(res);
  }
})().catch(err => console.error(err) && next(err));

module.exports = controller;
