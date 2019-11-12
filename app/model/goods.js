const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class GoodsModel extends Model {

  model() {
    return this.db().define(
      'goods', {
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
        description: {
          type: Sequelize.STRING(1000),
          defaultValue: ''
        },
        business_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        category_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        type: {
          type: Sequelize.INTEGER(2),
          defaultValue: 1
        },
        sku_id: {
          type: Sequelize.STRING(32),
          defaultValue: ''
        },
        sort: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        cover: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        content: {
          type: Sequelize.TEXT,
          defaultValue: ''
        },
        stock: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        sales: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        price: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        price_cost: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        price_market: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        price_score: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        price_vip: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        create_user: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        update_user: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_goods'
      }
    );
  }
}

module.exports = GoodsModel