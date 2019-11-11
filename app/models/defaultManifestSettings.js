const Sequelize = require('sequelize');

const attributes = {
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
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  metadata: {
    type: Sequelize.JSON,
    allowNull: true,
  },
};

const hierarchyConfig = {
  foreignKey: 'parentId',
  through: 'ancestry',
  throughTable: 'ancestries',
  throughKey: 'manifestId',
  // throughTable: 'ancestries',
  // throughSchema: 'ancestries',
  // freezeTableName: true,
  camelThrough: true,
  // onDelete: 'CASCADE',
};

module.exports = {
  attributes,
  hierarchyConfig,
};
