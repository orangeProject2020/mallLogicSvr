const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class PaymentModel extends Model {

  model() {
    return this.db().define(
      'statistics', {
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
        count_create: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        count_payment: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        count_complete: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        count_finish: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        count_cancel: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total_create: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total_payment: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total_complete: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total_finish: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        total_cancel: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        payment_count: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        payment_total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        }

      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_statistics'
      }
    );
  }
}

module.exports = PaymentModel