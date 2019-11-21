const Router = require('express').Router();
const providers = require('controllers/providers');
const driveController = require('controllers/drive');
const manifestController = require('controllers/manifest');
const webhooksController = require('controllers/webhooks');

const { buildRootNode } = require('helpers/tree');
const { ROOT_PATH, ROOT_PREFIX_REGEX_FULLPATH } = require('config/components/variables');


const superMulterMiddleware = require('lib/super-multer-stream-ext');
const Models = require('models').initializeModels();
const Manifest = Models.manifest;
const isUuid = require('is-uuid');
const path = require('path');


const providerControllers = Object.keys(providers);

const providerMap = providerControllers.reduce((acc, controllerName) => {
  const controller = providers[controllerName];
  acc[controller.provider] = controller;
  return acc;
}, {});

// static authentication for now
Router.use((req, res, next) => {
  req.userId = '3fb7f167-b601-4aa0-900a-1dac8d9a8e59';

  next();
});

// Build Root Node// Ideally should happen after sign up
Router.use(async (req, res, next) => {
  const rootNode = await buildRootNode(req.userId);

  req.rootNode = rootNode;
  next();
});

Router.param('provider', (req, res, next, provider) => {
  if (!providerMap[provider]) return res.status(400).send({
    errors: [
      {
        status: 400,
        title: 'BAD_REQUEST',
        detail: `Request was made with for an invalid/unsupported provider`,
        meta: {
          provider,
          message: 'Provider not supported',
        },
      },
    ],
  });

  next();
});

Router.param('fileId', async (req, res, next, fileId) => {
  const where = {
    userId: req.userId,
  };

  let simplePath;
  if (isUuid.v4(fileId)) {
    where.id = fileId;
  } else {
    const fileBuffer = Buffer.from(fileId, 'base64');
    simplePath = fileBuffer.toString();
    simplePath = simplePath.replace(ROOT_PREFIX_REGEX_FULLPATH, '').replace(/\/$/, '');
    where.fullPath = path.join(ROOT_PATH, simplePath);
  }
  // if (simplePath === '/' || ROOT_PREFIX_REGEX_FULLPATH.test(simplePath))

  const manifest = await Manifest.findOne({
    where,
    attributes: ['id'],
  });

  if (!manifest) return res.status(404).send({
    errors: [
      {
        status: 404,
        title: 'NOT_FOUND',
        detail: `manifest with id/path: ${ where.id || simplePath } was not found. Please check and try again.`,
      }
    ]
  });

  req.fileId = manifest.id;

  next();
});

Router.get('/:provider/login', async (req, res, next) => {
  return providerMap[req.params.provider].login(req, res, next);
})

Router.get('/:provider/callback', async (req, res, next) => {
  return providerMap[req.params.provider].callback(req, res, next);
})

// const multer = require('multer');
// const multerMultiStorage = require('lib/multer-stream');

// const uploader = multer({
//   storage: multerMultiStorage({}),
//   preservePath: true
// });
// const uploader = multer({ dest: 'uploads/', preservePath: true });
// Router.post('/uploadFile', uploader.any(), driveController.upload);
Router.post('/uploadFile', superMulterMiddleware, driveController.upload);
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

Router.post('/subscribe', webhooksController.create);
Router.get('/manifest/:fileId/size', manifestController.size);
Router.put('/manifest/:fileId', manifestController.update);
Router.delete('/manifest/:fileId', manifestController.del);
Router.get('/manifest/:fileId', manifestController.show);

module.exports = Router;
