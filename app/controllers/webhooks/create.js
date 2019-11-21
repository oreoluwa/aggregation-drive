const Models = require('models').initializeModels();
const Webhook = Models.webhook;
const { Op } = require('sequelize');
const webhookSerializer = require('serializers/webhookSerializer');

const createWebhookController = (req, res) => (async () => {
  const { userId, body: { data } } = req;
  const { endpoint, active, name, auth } = data.attributes;

  if (!endpoint) {
    // break
  }

  let disableOtherEndpoints;
  if (data.meta && data.meta.disableOtherEndpoints) {
    disableOtherEndpoints = data.meta.disableOtherEndpoints;
  };

  let disabledEndpoints;
  if (disableOtherEndpoints) {
    disabledEndpoints = await Webhook.update({
      active: false,
    }, {
      where: {
        userId,
        [ Op.not ]: {
          endpoint
        }
      }
    });
  };

  const defaults = {
    userId,
    endpoint,
    auth,
    active: ((typeof active !== 'undefined') && active) || true,
  };

  const [ webhook, isCreated ] = await Webhook.findOrCreate({
    where: defaults,
    defaults: {...defaults, name },
  });

  const status = isCreated ? 204 : 200;
  return res.status(status).send(webhookSerializer(webhook, { meta: disabledEndpoints }));
})().catch(console.error);

module.exports = createWebhookController;
