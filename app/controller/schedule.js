const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

/**
 * SELECT * , FROM_UNIXTIME(close_time) FROM t_order_item WHERE `status` = 3 AND package_level > 0;
 */

class ScheduleController extends Controller {

  /**
   * 每日平台收益结算
   * @param {*} args 
   * @param {*} ret 
   */
  async profitPlatformCheck(args, ret) {
    this.LOG.info(args.uuid, '/profitPlatformCheck', args)
    let date = args.date || ''
    let today = this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')
    if (!date) {
      ret.code = 1
      ret.message = '请选择正确的日期'
      return ret
    }

    // if (date == today) {
    //   ret.code = 1
    //   ret.message = '只能结算之前的'
    //   return ret
    // }

    let dateTimestart = this.UTILS.dateUtils.getTimestamp(date + ' 00:00:00')
    let dateTimeEnd = this.UTILS.dateUtils.getTimestamp(date + ' 23:59:59')

    let orderItemModel = new this.MODELS.orderItemModel
    let profitModel = new this.MODELS.profitModel
    let assetsModel = new this.MODELS.assetsModel

    // 计算当日平台总收益
    let items = await orderItemModel.model().findAll({
      where: {
        status: 3,
        profit_day_status: 0,
        close_time: {
          [Op.gte]: dateTimestart,
          [Op.lt]: dateTimeEnd
        }
      }
    })
    this.LOG.info(args.uuid, '/profitPlatformCheck items', items.length)
    if (items.length <= 0) {
      return ret
    }

    let totalProfit = 0
    let inviteUserIdsData = {} // 上级用户id
    items.forEach(item => {
      let itemProfit = (item.price - item.price_cost) * item.num
      totalProfit += itemProfit

      if (item.invite_user_id != '') {
        this.LOG.info(args.uuid, '/profitPlatformCheck item.invite_user_id', item.invite_user_id)
        if (inviteUserIdsData.hasOwnProperty(item.invite_user_id)) {
          inviteUserIdsData[item.invite_user_id]++
        } else {
          inviteUserIdsData[item.invite_user_id] = 1
        }
      }
    })
    this.LOG.info(args.uuid, '/profitPlatformCheck inviteUserIdsData', inviteUserIdsData)

    let totalProfitPlatform = parseInt(totalProfit * 10 / 100)
    this.LOG.info(args.uuid, '/profitPlatformCheck totalProfitPlatform', totalProfitPlatform)
    let profitPlatforms = [0, 0, 0]
    profitPlatforms[0] = parseInt(totalProfitPlatform * 20 / 100)
    profitPlatforms[1] = parseInt(totalProfitPlatform * 35 / 100)
    profitPlatforms[2] = totalProfitPlatform - profitPlatforms[0] - profitPlatforms[1]
    this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatforms', profitPlatforms)

    // 获取可分红用户
    let userGroupList = await assetsModel.getUserGroup(date, 'all')
    this.LOG.info(args.uuid, '/profitPlatformCheck userGroupList', userGroupList[0].length, userGroupList[1].length, userGroupList[2].length)

    // return ret

    // 每个用户进行结算
    let t = await profitModel.getTrans()
    try {
      for (let index = 0; index < userGroupList.length; index++) {
        let users = userGroupList[index]
        let profitPlatformAmount = profitPlatforms[index]
        this.LOG.info(args.uuid, '/profitPlatformCheck users:', '分红等级:', index, '人数：', users.length)
        if (users.length <= 0) {
          continue
        }

        // 每个用户获得分红
        // let profitPlatformUsers = {}
        // 先计算每个用户的比例
        let profitPlatformUsersBaseCount = users.length
        this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUsersBaseCount:', profitPlatformUsersBaseCount)
        let profitPlatformUserRateCounts = {}
        users.forEach(user => {
          let userId = user.user_id
          let userRateCount = 1
          Object.keys(inviteUserIdsData).forEach(inviteUserId => {
            if (userId == inviteUserId) {
              this.LOG.info(args.uuid, '/profitPlatformCheck userId:', userId)
              let userCount = inviteUserIdsData[inviteUserId]
              this.LOG.info(args.uuid, '/profitPlatformCheck userCount:', userCount)
              profitPlatformUsersBaseCount += userCount
              userRateCount += userCount
            }
          })
          profitPlatformUserRateCounts[userId] = userRateCount
        })

        this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUserRateCounts:', profitPlatformUserRateCounts)
        this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUsersBaseCount:', profitPlatformUsersBaseCount)
        // let profitPlatformUser = parseInt(profitPlatformAmount / users.length)
        // this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUser:', profitPlatformUser)

        // 记录用户分红
        for (let indexU = 0; indexU < users.length; indexU++) {
          let user = users[indexU];
          let userId = user.user_id
          this.LOG.info(args.uuid, '/profitPlatformCheck userId:', userId)

          // 用户分红
          let profitPlatformUser = parseInt(profitPlatformUserRateCounts[userId] / profitPlatformUsersBaseCount * profitPlatformAmount)
          this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUser rate:', `${profitPlatformUserRateCounts[userId]}/${profitPlatformUsersBaseCount}`)
          this.LOG.info(args.uuid, '/profitPlatformCheck profitPlatformUser:', profitPlatformUser)

          let userProfit = (user.profit >= profitPlatformUser) ? profitPlatformUser : user.profit
          this.LOG.info(args.uuid, '/profitPlatformCheck userProfit:', userProfit)

          let profit = await profitModel.model().create({
            user_id: userId,
            type: 2,
            date: date,
            amount: userProfit,
            order_id: 0,
            goods_id: 0,
            status: 1
          }, {
            transaction: t
          })

          if (!profit) {
            throw new Error('记录用户收益数据失败：' + userId)
          }
          this.LOG.info(args.uuid, '/profitPlatformCheck profit.id:', profit.id)

          let assetsRet = await assetsModel.logCharge(userId, userProfit, t, true)
          this.LOG.info(args.uuid, '/profitPlatformCheck assetsRet:', assetsRet)
          if (!assetsRet) {
            throw new Error('添加用户收益数据失败: ' + userId)
          }

        }
      }

      for (let index = 0; index < items.length; index++) {
        let item = items[index]
        item.profit_day_status = 1
        let itemUpdate = await item.save({
          transaction: t
        })
        if (!itemUpdate) {
          throw new Error('更新订单收益状态失败')
        }
      }

      // throw new Error('test')

      t.commit()
    } catch (err) {
      console.error(err)
      ret.code = 1
      ret.message = err.message
      t.rollback()
    }

    return ret

  }

  /**
   * 每日收益结算
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobProfitUserClose(args, ret) {
    this.LOG.info(args.uuid, '/dayJobProfitClose', args)

    let listRet = await this._listByDate(args, ret)
    let list = listRet.data || []
    this.LOG.info(args.uuid, '/dayJobProfitClose list length:', list.length)

    let profitModel = new this.MODELS.profitModel
    let assetsModel = new this.MODELS.assetsModel
    let len = 0

    for (let index = 0; index < list.length; index++) {
      let item = list[index];
      this.LOG.info(args.uuid, '/dayJobProfitClose item:', index, list)

      let userId = item.user_id
      let balance = item.amount

      let t = await profitModel.getTrans()

      try {
        let assetsRet = await assetsModel.logCharge(userId, balance, t)
        this.LOG.info(args.uuid, '/dayJobProfitClose assetsRet:', assetsRet)
        if (!assetsRet) {
          throw new Error(`记录用户${userId}资产增加失败`)
        }

        let updateRet = await this._updateItemStatus({
          id: item.id,
          uuid: args.uuid
        }, {
          code: 0,
          message: ''
        }, t)
        this.LOG.info(args.uuid, '/dayJobProfitClose updateRet:', updateRet)
        if (updateRet.code) {
          throw new Error(updateRet.message || `用户收益${userId}记录状态更新失败`)
        }
        await t.commit()
        len++
      } catch (err) {
        console.error(err)
        this.LOG.error(args.uuid, '/dayJobProfitClose err:', err.message)
        await t.rollback()
      }

    }

    ret.data = {
      success: len,
      fail: list.length - len
    }

    return ret
  }

  /**
   * 生成每日客户收益
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobProfitUserCheck(args, ret) {
    this.LOG.info(args.uuid, '/dayJobProfitCheck', args)
    let orderItemModel = new this.MODELS.orderItemModel
    // let now = parseInt(Date.now() / 1000)
    let list = await orderItemModel.model().findAll({
      where: {
        status: 3,
        profit_status: 0 // 为进行收益处理的
      }
    })

    this.LOG.info(args.uuid, '/dayJobProfitUserCheck list length', list.length)
    let len = 0
    for (let index = 0; index < list.length; index++) {
      let item = list[index];
      this.LOG.info(args.uuid, '/dayJobProfitUserCheck item', item)
      let createRet = await this._createByOrderItem({
        uuid: args.uuid,
        id: item.id
      }, {
        code: 0,
        message: ''
      })
      this.LOG.info(args.uuid, '/list createRet', item.id, createRet)
      if (createRet.code === 0) {
        len++
      }
    }

    ret.data = {
      success: len,
      fail: list.length - len
    }

    return ret
  }

  /**
   * 生成收益数据by订单物品
   * @param {*} args 
   * @param {*} ret 
   * @param {*} opts 
   */
  async _createByOrderItem(args, ret, opts = {}) {
    this.LOG.info(args.uuid, '/_createByOrderItem', args)
    let orderItemModel = new this.MODELS.orderItemModel
    let profitModel = new this.MODELS.profitModel
    let assetsModel = new this.MODELS.assetsModel

    let t = opts.transaction || null
    if (!t) {
      t = await orderItemModel.getTrans()
      opts.transaction = t
    }

    try {
      let orderItem = await orderItemModel.model().findByPk(args.id)
      this.LOG.info(args.uuid, '/_createByOrderItem orderItem', orderItem)
      let userId = orderItem.user_id
      let profitTotal = (orderItem.price - orderItem.price_cost) * orderItem.num // 总利润
      this.LOG.info(args.uuid, '/_createByOrderItem profitTotal', profitTotal)

      let profitLimit = orderItem.package_profit || 0 // 用户收益额度
      let profitLevel = orderItem.package_level || 0
      this.LOG.info(args.uuid, '/_createByOrderItem profitLimit', profitLimit)
      this.LOG.info(args.uuid, '/_createByOrderItem profitLevel', profitLevel)

      orderItem.profit_status = 1
      let updateItemRet = await orderItem.save(opts)
      if (!updateItemRet) {
        throw new Error('更改订单商品收益处理状态失败')
      }

      let profitDays = 0
      let closeTime = orderItem.close_time || parseInt(Date.now() / 1000)
      if (profitLevel) {
        // 分润等级
        profitDays = 5
        let profitAmount = parseInt(profitTotal / 2 / profitDays)
        this.LOG.info(args.uuid, '/_createByOrderItem profitAmount', profitAmount)

        let date = closeTime + (profitDays + 1) * 24 * 3600
        date = this.UTILS.dateUtils.dateFormat(date, 'YYYY-MM-DD')
        this.LOG.info(args.uuid, '/_createByOrderItem date', date)
        let assetsProfitRet = await assetsModel.logProfitAdd(userId, {
          profit: profitLimit,
          level: profitLevel,
          date: date,
          remark: JSON.stringify({
            order_id: orderItem.order_id,
            order_item_id: orderItem.id
          })
        })
        this.LOG.info(args.uuid, '/_createByOrderItem assetsProfitRet', assetsProfitRet)
        if (!assetsProfitRet) {
          throw new Error('设置用户分润出现问题')
        }

        for (let j = 1; j <= profitDays; j++) {
          let dateTimestamp = closeTime + j * 24 * 3600
          let dateJ = this.UTILS.dateUtils.dateFormat(dateTimestamp, 'YYYY-MM-DD')
          this.LOG.info(args.uuid, '/_createByOrderItem dateJ', dateJ)
          let profit = await profitModel.model().findOne({
            where: {
              order_id: orderItem.order_id,
              goods_id: orderItem.goods_id,
              date: dateJ
            }
          })
          if (profit) {
            continue
          } else {
            profit = await profitModel.model().create({
              order_id: orderItem.order_id,
              goods_id: orderItem.goods_id,
              date: dateJ,
              type: 1,
              user_id: userId,
              amount: profitAmount
            }, opts)
            this.LOG.info(args.uuid, '/_createByOrderItem profit', profit)
            if (!profit) {
              throw new Error('记录收益失败')
            }
          }
        }
      }
      await t.commit()

    } catch (err) {
      console.error(err)
      ret.code = 1
      ret.message = err.message || 'createProfitByOrder error'
      await t.rollback()
    }

    return ret
  }

  /**
   * 每日结算的列表
   * @param {*} args 
   * @param {*} ret 
   */
  async _listByDate(args, ret) {
    this.LOG.info(args.uuid, '/_listByDate', args)
    let profitModel = new this.MODELS.profitModel

    let date = args.date || this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')

    let list = await profitModel.model().findAll({
      where: {
        date: {
          [Op.lte]: date
        },
        status: 0
      }
    })

    let retData = []
    list.forEach(item => {
      retData.push({
        id: item.id,
        user_id: item.user_id,
        amount: item.amount
      })
    })

    ret.data = retData
    return ret
  }

  /**
   * 更新状态
   * @param {*} args 
   * @param {*} ret 
   */
  async _updateItemStatus(args, ret, t = null) {
    this.LOG.info(args.uuid, '/_updateItemStatus', args)
    let id = args.id
    let profitModel = new this.MODELS.profitModel

    let profit = await profitModel.model().findByPk(id)

    if (!profit) {
      ret.code = 1
      ret.message = '已创建'
      return ret
    }

    let opts = {}
    if (t) {
      opts.transaction = t
    }

    profit.status = 1
    await profit.save(opts)

    return ret
  }

}

module.exports = ScheduleController