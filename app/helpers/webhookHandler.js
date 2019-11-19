let modelsCache = {};

const modelHandler = {
  get: (models, model) => {
    if(models.hasOwnProperty(model)) {
      return models[model];
    }
    modelsCache = require('models').initializeModels();

    return modelsCache[model];
  },
};

const Models = new Proxy(modelsCache, modelHandler);
const manifestSerializer = require('serializers/manifestSerializer');
const axios = require('axios');

const notifyWebhook = (webhook, manifest, triggerEvent) => {
  const {
    endpoint,
    auth
  } = webhook;
  const requestOptions = {};
  const requestParams = {};
  if (auth && auth.type === 'basic') requestOptions.auth = {
    username: auth.username,
    password: auth.password
  };

  requestOptions.validateStatus = (status) => {
    return true;
    // return status >= 200 && status < 300; // default
  };

  requestParams.data = manifestSerializer(manifest);
  requestParams.meta = {
    trigger: triggerEvent,
  };

  axios.post(endpoint, requestParams, requestOptions);
};

const handleCommitNotification = async (userId, manifestOrManifestId, triggerEvent) => {
  if (manifestOrManifestId) {
    let manifest = manifestOrManifestId;

    const Webhook = Models.webhook;
    const webhooks = await Webhook.findAll({
      where: {
        userId,
        active: true,
      },
    });

    webhooks.forEach(webhook => notifyWebhook(webhook, manifest, triggerEvent));
  } else {
    throw new Error('Not Known');
  }
}

module.exports = handleCommitNotification;
