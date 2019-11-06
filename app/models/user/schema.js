/**
 * User Schema module
 */

const Sequelize = require('sequelize');

module.exports = (sequelizeDB, modelName) => {
  const User = sequelizeDB.define(modelName, {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.identity, {
      foreignKey: 'userId',
    });
    User.hasMany(models.manifest, {
      foreignKey: 'userId',
    });
  };

  return User;
};
