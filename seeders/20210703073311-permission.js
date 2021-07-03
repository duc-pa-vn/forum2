'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     return queryInterface.bulkInsert('permission', [{
      name: 'add_box',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'edit_box',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'delete_box',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'read_box',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'add_post',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'edit_post',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'delete_post',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'read_post',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'add_comment',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'edit_comment',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'delete_comment',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'read_comment',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'add_user',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'edit_user',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'delete_user',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'read_box',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete('permission', null, {});
  }
};
