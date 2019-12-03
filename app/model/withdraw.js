const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class WithdrawModel extends Model {

  model() {
    return this.db().define(
      'withdraw', {
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
        user_id: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        amount: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        apply_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        audit_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        audit_user: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        audit_remark: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        uuid: {
          type: Sequelize.STRING(64),
          defaultValue: Sequelize.UUIDV4()
        },
        info: {
          type: Sequelize.TEXT,
          defaultValue: ''
        }

      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_withdraw'
      }
    );
  }

}

module.exports = WithdrawModel