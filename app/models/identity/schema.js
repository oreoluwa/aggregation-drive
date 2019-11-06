/**
 * Identity Schema module
 */

const { appPrefix } = require('package.json').config;

const Sequelize = require('sequelize');
module.exports = (sequelizeDB, modelName) => {
  const Identity = sequelizeDB.define(modelName, {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    folderName: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: appPrefix,
    },
    folderId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  Identity.associate = (models) => {
    Identity.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return Identity;
};
