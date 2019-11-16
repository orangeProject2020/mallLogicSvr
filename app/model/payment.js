const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class PaymentModel extends Model {

  model() {
    return this.db().define(
      'payment', {
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
        order_ids: {
          type: Sequelize.STRING(1000),
          defaultValue: ''
        },
        out_trade_no: {
          type: Sequelize.STRING(32),
          defaultValue: ''
        },
        user_id: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        amount: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        balance: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        score: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        coupon: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        pay_type: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        pay_method: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
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
        tableName: 't_payment'
      }
    );
  }
}

module.exports = PaymentModel