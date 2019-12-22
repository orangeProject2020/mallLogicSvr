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
        },
        profit: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        profit_date: {
          type: Sequelize.STRING(12),
          defaultValue: 0
        },
        profit_level: {
          type: Sequelize.INTEGER(2),
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
        },
        profit: {
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
  async getItemByUserId(userId) {
    let data = await this.model().findOne({
      where: {
        user_id: userId
      }
    })
    if (!data) {
      data = await this.model().create({
        user_id: userId,
        balance: 0,
        profit: 0,
        profit_date: '',
        profit_level: 0
      })
    }

    return data
  }

  /**
   * 充值
   * @param {*} userId 
   * @param {*} balance 
   */
  async logCharge(userId, balance, t = null, profit = false) {
    let assets = await this.getItemByUserId(userId)
    let opts = {}
    if (t) {
      opts.transaction = t
    }

    if (profit) {
      if (assets.profit < balance) {
        return false
      }
      assets.profit = assets.profit - balance
    }

    assets.balance = assets.balance + balance

    await assets.save(opts)

    let logRet = await this.logsModel().create({
      user_id: userId,
      balance: balance,
      profit: profit ? (-1 * balance) : 0,
      type: 1
    }, opts)

    return logRet ? true : false
  }

  /**
   * 提现
   * @param {*} userId 
   * @param {*} balance 
   */
  async logWithdraw(userId, balance, t = null) {
    let assets = await this.getItemByUserId(userId)
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
      user_id: userId,
      balance: -1 * balance,
      type: 2
    }, opts)

    return logRet ? true : false
  }

  /**
   * 记录收益
   * @param {*} userId 
   * @param {*} profitData 
   */
  async logProfitAdd(userId, profitData = {}, t = null) {
    let assets = await this.getItemByUserId(userId)
    let opts = {}
    if (t) {
      opts.transaction = t
    }

    assets.profit = assets.profit + (profitData.profit || 0)
    if (profitData.date) {
      assets.profit_date = profitData.date
    }
    if (profitData.level && profitData.level > assets.profit_level) {
      assets.profit_level = profitData.level
    }
    assets.remark = profitData.remark || ''

    await assets.save(opts)

    if (profitData.profit) {
      let logRet = await this.logsModel().create({
        user_id: userId,
        profit: profitData.profit,
        type: 3
      }, opts)
      return logRet ? true : false
    }

    return true

  }

  async getUserGroup(date, field = 'id') {
    let list = await this.model().findAll({
      where: {
        profit: {
          [Sequelize.Op.gt]: 0
        },
        profit_date: {
          [Sequelize.Op.lte]: date
        },
        profit_level: {
          [Sequelize.Op.gt]: 0
        }
      }
    })

    let group = [
      [],
      [],
      []
    ]
    for (let index = 0; index < list.length; index++) {
      let item = list[index];
      let level = item.profit_level
      if (!group[level - 1]) {
        group[level - 1] = []
      }
      if (field == 'id') {
        group[level - 1].push(item.user_id)
      } else {
        group[level - 1].push(item)
      }

    }

    return group
  }

}

module.exports = AssetsModel