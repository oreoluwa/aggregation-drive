/**
 * Ancestry Schema module
 */

const Sequelize = require('sequelize');

module.exports = (sequelizeDB, modelName) => {
  const Ancestry = sequelizeDB.define(modelName, {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    manifestId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    ancestorId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
  }, {
    // tableName: 'ancestries',
  });

  return Ancestry;
};
