const Router = require('express').Router();
const providers = require('controllers/providers');
const driveController = require('controllers/drive');
const manifestController = require('controllers/manifest');
const multer = require('multer');
const multerMultiStorage = require('lib/multer-stream');

const providerControllers = Object.keys(providers);

const providerMap = providerControllers.reduce((acc, controllerName) => {
  const controller = providers[controllerName];
  acc[controller.provider] = controller;
  return acc;
}, {});

const validateProvider = (req, res, next) => {
  if (!providerMap[req.params.provider]) {
    return res.status(400).send({
      errors: {
        provider: req.params.provider,
        message: 'Provider not supported',
      }
    })
  }

  next();
}

// static authentication for now
Router.use((req, res, next) => {
  req.userId = '3fb7f167-b601-4aa0-900a-1dac8d9a8e59';

  next();
});

Router.get('/:provider/login', validateProvider, async (req, res, next) => {
  return providerMap[req.params.provider].login(req, res, next);
})

Router.get('/:provider/callback', validateProvider, async (req, res, next) => {
  return providerMap[req.params.provider].callback(req, res, next);
})

const uploader = multer({
  storage: multerMultiStorage({}),
  preservePath: true
});
// const uploader = multer({ dest: 'uploads/', preservePath: true });
Router.post('/uploadFile', uploader.any(), driveController.upload);
Router.get('/download/:fileId', driveController.download);

Router.get('/upload', (req, res) => {
  return res.status(200).send(`
    <p>Select The Directory:
      <form enctype="multipart/form-data" action="/uploadFile" method="post">
      <input type="file" name="file" webkitdirectory mozdirectory multiple directory allowdirs/>
      <input type='submit' value='Submit' />
      </form>
    </p>
    <p>You can select any directory with multiple files or multiple child directories in it.</p>
  `)
})

Router.put('/manifest/:fileId', manifestController.update);

module.exports = Router;
