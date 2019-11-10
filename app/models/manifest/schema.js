/**
 * Manifest Schema module
 */
const Sequelize = require('sequelize');
const defaultManifestSettings = require('models/defaultManifestSettings');

module.exports = (sequelizeDB, modelName) => {
  const Manifest = sequelizeDB.define(modelName, {
    ...defaultManifestSettings.attributes,
    digest: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    mimeType: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    size: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    providerManifestId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isDirectory: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    hierarchy: defaultManifestSettings.hierarchyConfig,
  });

  Manifest.associate = (models) => {
    Manifest.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return Manifest;
};
