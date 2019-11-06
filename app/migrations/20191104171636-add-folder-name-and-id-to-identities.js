'use strict';

const { appPrefix } = require('package.json').config;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'identities',
      'folderName',
      {
        type: Sequelize.STRING,
        defaultValue: appPrefix,
        allowNull: true,
      },
    );
    await queryInterface.addColumn(
      'identities',
      'folderId',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    await queryInterface.addIndex('identities', ['folderName']);
    await queryInterface.addIndex('identities', ['folderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('identities', 'folderId');
    await queryInterface.removeColumn('identities', 'folderName');
  }
};
