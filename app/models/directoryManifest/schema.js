/**
 * DirectoryManifest Schema module
 */
const Sequelize = require('sequelize');
const defaultManifestSettings = require('models/defaultManifestSettings');

module.exports = (sequelizeDB, modelName) => {
  const DirectoryManifest = sequelizeDB.define(modelName, {
    ...defaultManifestSettings.attributes,
    isDirectory: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    defaultScope: {
      where: {
        isDirectory: true
      }
    },
    freezeTableName: true,
    tableName: 'manifests',
    hierarchy: defaultManifestSettings.hierarchyConfig,
  });

  DirectoryManifest.associate = (models) => {
    DirectoryManifest.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return DirectoryManifest;
};
