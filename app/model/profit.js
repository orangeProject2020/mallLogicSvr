const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class profitModel extends Model {

  model() {
    return this.db().define(
      'profit', {
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
        order_id: {
          type: Sequelize.BIGINT(20),
          defaultValue: 0
        },
        goods_id: {
          type: Sequelize.BIGINT(20),
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
        type: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        date: {
          type: Sequelize.STRING(12),
          defaultValue: ''
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_profit'
      }
    );
  }

  configModel() {
    return this.db().define(
      'profit_config', {
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
        total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        amount: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        date: {
          type: Sequelize.STRING(12),
          defaultValue: ''
        },
        level: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_profit_config'
      }
    );
  }

  dateModel() {
    return this.db().define(
      'profit_date', {
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
        date: {
          type: Sequelize.STRING(12),
          defaultValue: ''
        },
        total: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        sell: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        platform: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        platform_0: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        platform_1: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        platform_2: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        people: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        people_0: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        people_1: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        people_2: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_profit_date'
      }
    );
  }

  /**
   * 用户收益设置
   * @param {*} userId 
   * @param {*} data 
   * @param {*} opts 
   */
  async configSet(userId, data = {}, opts = {}) {
    let item = await this.configModel().findOne({
      where: {
        user_id: userId
      }
    })

    if (item) {
      item.total = item.total + data.limit
      item.amount = item.amount + date.limit
      item.date = data.data
      if (data.level && data.level > item.level) {
        item.level = data.level
      }

      let updateRet = await item.save(opts)
      return updateRet
    } else {
      item = await this.configModel().create({
        user_id: userId,
        total: data.limit || 0,
        date: data.date || '',
        level: data.level || 0,
        amount: data.limit
      }, opts)
    }

    return item
  }

  /**
   * 获取每天分润人数
   * @param {*} date 
   */
  async getUserGroup(date) {
    let list = await this.configModel().findAll({
      where: {
        amount: {
          [Sequelize.Op.gt]:0
        },
        date: {
          [Sequelize.Op.gte]: date
        }
      }
    })

    let group = [[],[],[]]
    for (let index = 0; index < list.length; index++) {
      let item = list[index];
      if (!group[item.level - 1]) {
        group[item.level -1] = []
      }
      group[item.level - 1].push(item.user_id)
    }

    return group
  }

  async dateDataSet(data, opts={}) {
    let item = await this.dateModel().findOne({
      where: {
        date: data.date
      }
    })
    if (item) {
      item.total = data.total
      item.sell = data.sell
      item.platform = data.platform
      item.platform_0 = data.platform_0
      item.platform_1 = data.platform_1
      item.platform_1 = data.platform_1
      item.people = data.people
      item.people_0 = data.people_0
      item.people_1 = data.people_1
      item.people_2 = data.people_2
      await item.save(opts)
    } else {
      let createData = {}
      createData.date = data.date
      createData.total = data.total
      createData.sell = data.sell
      createData.platform = data.platform
      createData.platform_0 = data.platform_0
      createData.platform_1 = data.platform_1
      createData.platform_1 = data.platform_1
      createData.people = data.people
      createData.people_0 = data.people_0
      createData.people_1 = data.people_1
      createData.people_2 = data.people_2
      item = await this.dateModel().create(createData, opts)
    }
    return item
  }
}

module.exports = profitModel