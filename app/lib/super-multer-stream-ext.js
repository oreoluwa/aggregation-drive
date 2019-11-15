const multer = require('multer');

const Drive = require('lib/drive/drive');
const multerMultiStorage = require('lib/multer-stream');

const superMulterMiddleware = async (req, res, next) => {
  const userDrive = await Drive.getUserDrive(req.userId);

  const uploader = multer({
    storage: multerMultiStorage(userDrive),
    preservePath: true
  });

  const multerMiddleware = uploader.any();
  return multerMiddleware(req, res, next);
}


module.exports = superMulterMiddleware;
