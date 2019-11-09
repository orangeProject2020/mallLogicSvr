const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class CategoryModel extends Model {

  model() {
    return this.db().define(
      'category', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        create_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: parseInt(Date.now() / 1000)
        },
        update_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: parseInt(Date.now() / 1000)
        },
        status: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        name: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        title: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        pid: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        sort: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        cover: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_category'
      }
    );
  }
}

module.exports = CategoryModel