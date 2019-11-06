const glob = require('glob');
const path = require('path');

const db = require('config/components/db');
const Sequelize = require('sequelize');

const modelFiles = glob.sync(path.join(__dirname, '/*/schema.js'));

const getModels = () => {
  const models = {};

  [ ...modelFiles ].forEach((model) => {
    const modelName = model.replace(/^.*models\/(.+)\/schema\.js$/, '$1');
    models[modelName] = require(model)(db, modelName);
  });
  return models;
};


const defineRelations = (models) => {
  Object.keys(models).forEach((model) => {
    if (Object.prototype.hasOwnProperty.call(models[model], 'associate')) {
      models[model].associate(models);
    }
  });
};

const initializeModels = () => {
  const models = getModels();
  defineRelations(models);
  return models;
};

module.exports = {
  initializeModels,
};
