const Sequelize = require('sequelize');
const path = require('path');

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
  pathArray: {
    type: Sequelize.VIRTUAL(Sequelize.ARRAY, ['fullPath']),
    get: function () {
      let fullPath = this.get('fullPath');
      if (fullPath && fullPath.substr(0, 1) === '/'){
        fullPath = fullPath.substr(1);
      }
      return fullPath.split('/');
    },
    set: function (value) { this.setDataValue('fullPath', path.join('/', ...value) ) }
  }
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
