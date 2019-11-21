const httpClient = require('helpers/client');
const util = require('util');
const DOWNLOAD_ENDPOINT = 'download/%s'

const controller = (req, res, next) => ( async () => {
  const endpoint = util.format(DOWNLOAD_ENDPOINT, req.query.items);
  const response = await httpClient.get({
    endpoint,
    config: {
      responseType: 'stream',
    },
  });

  const responseData = response.data;
  if (!(response.status >= 200 && response.status < 300)) {
    return sendType(res, 410, responseData, {});
  };

  res.writeHead(response.status, response.headers);

  responseData.pipe(res);
})().catch(err => console.error(err) && next(err));

module.exports = controller;
