'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('manifests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      parentDir: {
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
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isDirectory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      chunkPosition: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      chunkHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },

    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('manifests');
  }
};
