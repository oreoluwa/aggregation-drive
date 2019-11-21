/**
 * Webhook Schema module
 */
const Sequelize = require('sequelize');
module.exports = (sequelizeDB, modelName) => {
  const Webhook = sequelizeDB.define(modelName, {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    endpoint: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    auth: {
      type: Sequelize.JSON,
      allowNull: true,
    },
  });

  Webhook.associate = (models) => {
    Webhook.belongsTo(models.user, {
      foreignKey: 'userId',
    });
  };

  return Webhook;
};
