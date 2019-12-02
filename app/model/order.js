const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class OrderModel extends Model {

  model() {
    return this.db().define(
      'order', {
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
        order_no: {
          type: Sequelize.STRING(32),
          defaultValue: ''
        },
        user_id: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        score: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        address: {
          type: Sequelize.TEXT,
          defaultValue: ''
        },
        express_info: {
          type: Sequelize.TEXT,
          defaultValue: ''
        },
        remark: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        description: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        payment_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        cancel_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        cancel_reason: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        express_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        finish_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        business_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_order'
      }
    );
  }
}

module.exports = OrderModel