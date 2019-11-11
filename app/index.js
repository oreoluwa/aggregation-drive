const express = require('express');
const bodyParser = require('body-parser');

const morgan = require('morgan');

process.on('unhandledRejection', (e) => {
  console.log(e.message, e.stack);
});

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Set the application START_TIME
app.START_TIME = +new Date();

module.exports = (async () => {
  const routes = require('./routes');
  app.use(routes);

  const serverPort = process.env.SERVER_PORT || process.env.PORT || 3000;
  app.listen(serverPort, () => {
    console.log('app started on port %s', serverPort);
  });
})().catch(console.error);
