const polka = require('polka');

const app = polka();

require('./routes')(app);

const port = process.env.SERVER_PORT || 3004;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log('Server started on %s:%s', host, port);
});
