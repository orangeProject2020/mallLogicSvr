const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class OrderItemModel extends Model {

  model() {
    return this.db().define(
      'orderItem', {
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
        business_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        order_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        goods_id: {
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
        user_id: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        name: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        cover: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        num: {
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
        score: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        score_max: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        package_level: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        package_profit: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        profit_status: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_order_item'
      }
    );
  }
}

module.exports = OrderItemModel