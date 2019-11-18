const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class AssetsModel extends Model {

  model() {
    return this.db().define(
      'assets', {
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
      balance: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      }

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_assets'
    }
    );
  }

  /**
   * 记录表
   */
  logsModel() {
    return this.db().define(
      'assets_logs', {
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
      type: {
        type: Sequelize.INTEGER(2),
        defaultValue: 1
      },
      user_id: {
        type: Sequelize.STRING(64),
        defaultValue: ''
      },
      balance: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      }

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_assets_logs'
    }
    );
  }

  /**
   * 获取单个用户资产
   * @param {*} userId 
   */
  getItemByUserId(userId) {
    let data = await this.model().findOne({
      where: {
        user_id: userId
      }
    })
    if (!data) {
      data = await this.model().create({
        user_id: user_id,
        balance: balance
      })
    }

    return data
  }

  /**
   * 充值
   * @param {*} userId 
   * @param {*} balance 
   */
  logCharge(userId, balance, t = null) {
    let assets = await this.getItemByUserId(userId)
    let opts = {}
    if (t) {
      opts.transaction = t
    }
    assets.balance = assets.balance + balance
    await assets.save(opts)

    let logRet = await this.logsModel().create({
      user_id: user_id,
      balance: balance,
      type: 1
    }, opts)

    return logRet ? true : false
  }

  /**
   * 提现
   * @param {*} userId 
   * @param {*} balance 
   */
  logWithdraw(userId, balance, t = null) {
    let assets = await this.getItemByUserId(user_id)
    let opts = {}
    if (t) {
      opts.transaction = t
    }
    if (assets.balance < balance) {
      return false
    }

    assets.balance = assets.balance - balance
    await assets.save(opts)

    let logRet = await this.logsModel().create({
      user_id: user_id,
      balance: -1 * balance,
      type: 2
    }, opts)

    return logRet ? true : false
  }
}

module.exports = AssetsModel