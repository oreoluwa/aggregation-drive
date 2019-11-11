'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'manifests',
      'hierarchyLevel',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
    await queryInterface.addIndex('manifests', ['hierarchyLevel']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('manifests', 'hierarchyLevel');
  }
};
