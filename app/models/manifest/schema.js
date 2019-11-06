/**
 * Manifest Schema module
 */

const Sequelize = require('sequelize');

module.exports = (sequelizeDB, modelName) => {
  const Manifest = sequelizeDB.define(modelName, {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    digest: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fullPath: {
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
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },
  });

  Manifest.associate = (models) => {
    Manifest.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return Manifest;
};
