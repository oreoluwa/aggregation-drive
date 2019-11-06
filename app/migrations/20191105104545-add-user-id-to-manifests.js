'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'manifests',
      'userId',
      {
        type: Sequelize.UUID,
        allowNull: true,
      },
    );
    await queryInterface.addIndex('manifests', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('manifests', 'userId');
  }
};
