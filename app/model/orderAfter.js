const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class OrderAfterModel extends Model {

  model() {
    return this.db().define(
      'orderAfter', {
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
        user_id: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        order_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        order_item_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        goods_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        type: {
          type: Sequelize.INTEGER(2),
          defaultValue: 1
        },
        after_no: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        reason: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        pics: {
          type: Sequelize.STRING(1000),
          defaultValue: ''
        },
        remark: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        }


      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_order_after'
      }
    );
  }
}

module.exports = OrderAfterModel