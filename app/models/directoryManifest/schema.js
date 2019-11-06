/**
 * DirectoryManifest Schema module
 */

const Sequelize = require('sequelize');

module.exports = (sequelizeDB, modelName) => {
  const DirectoryManifest = sequelizeDB.define(modelName, {
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
    fullPath: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isDirectory: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
  }, {
    defaultScope: {
      where: {
        isDirectory: true
      }
    },
    freezeTableName: true,
    tableName: 'manifests',
  });

  DirectoryManifest.associate = (models) => {
    DirectoryManifest.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return DirectoryManifest;
};
