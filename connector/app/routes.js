// const childrenController = require('controllers/files/children');
const filesController = require('controllers/files');

module.exports = (app) => {
  app.use((req, res, next) => {
    // req.headers.origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');

    if (req.method.toUpperCase() === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }
    next();
  });

  app.use('/files', (req, _, next) => {
    req.fileId = req.params.fileId ? req.params.fileId : 'Lw'
    return next();
  });

  app.get('/files', filesController.show);
  // app.post('/files', );
  app.get('/files/:fileId', filesController.show);
  // app.delete('/files/:fileId');
  // app.patch('/files/:fileId');
  app.get('/files/:fileId/children', filesController.children);
  app.get('/files/:fileId/search', filesController.search);
  app.get('/download', filesController.download);
}
