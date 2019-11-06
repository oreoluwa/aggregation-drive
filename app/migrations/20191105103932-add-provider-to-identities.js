'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'identities',
      'provider',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );
    await queryInterface.addIndex('identities', ['provider']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('identities', 'provider');
  }
};
