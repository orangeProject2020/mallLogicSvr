const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class ProfitController extends Controller {

  /**
   * 收益列表
   * @param {}} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let profitModel = new this.MODELS.profitModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = status
    }
    if (args.hasOwnProperty('user_id')) {
      where.user_id = args.user_id
    }

    opts.where = where

    let page = args.page || 1
    let limit = args.limit || 0

    if (limit) {
      opts.offset = (page - 1) * limit
      opts.limit = limit
    }

    opts.order = [
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, '/list opts', opts)

    let profitRet = await profitModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list profitRet', profitRet)
    ret.data = profitRet

    return ret
  }

  /**
   * 每日收益结算
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobProfitUserClose(args, ret) {
    this.LOG.info(args.uuid, '/dayJobProfitClose', args)

    let listRet = await this.listByDate(args, ret)
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

        let updateRet = await this.updateItemStatus({
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
      if (profitLevel) {
        // 分润等级
        profitDays = 5
        let profitAmount = parseInt(profitTotal / 2 / profitDays)
        this.LOG.info(args.uuid, '/_createByOrderItem profitAmount', profitAmount)

        let date = parseInt(Date.now() / 1000) + (profitDays + 1) * 24 * 3600
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
          let dateTimestamp = parseInt(Date.now() / 1000) + j * 24 * 3600
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
   * 创建订单收益
   * @param {*} args 
   * @param {*} ret 
   */
  // async createByOrder(args, ret) {
  //   this.LOG.info(args.uuid, '/createByOrder', args)
  //   let orderId = args.order_id || args.id || 0
  //   // let date = this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')

  //   let orderItemModel = new this.MODELS.orderItemModel
  //   let orderModel = new this.MODELS.orderModel
  //   // let profitModel = new this.MODELS.profitModel
  //   let t = await orderModel.getTrans()
  //   let opts = {
  //     transaction: t
  //   }
  //   let retData = []
  //   try {

  //     let order = await orderModel.model().findByPk(orderId)
  //     if (!order || order.status != 3) {
  //       throw new Error('订单状态错误')
  //     }

  //     let orderItems = await orderItemModel.model().findAll({
  //       where: {
  //         order_id: orderId
  //       }
  //     })

  //     for (let index = 0; index < orderItems.length; index++) {
  //       let item = orderItems[index];

  //       let createRet = await this._createByOrderItem({
  //         uuid: args.uuid,
  //         id: item.id
  //       }, {
  //         code: 0,
  //         message: ''
  //       }, opts)
  //       this.LOG.info(args.uuid, '/list createRet', item.id, createRet)
  //       if (createRet.code === 0) {
  //         len++
  //       }

  //     }

  //   } catch (err) {
  //     ret.code = 1
  //     ret.message = err.message || 'createByOrder error'
  //   }

  //   ret.data = retData

  //   return ret
  // }

  /**
   * 每日平台返利结算
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobProfitPlatformCheck(args, ret) {
    this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck', args)
    let date = args.date || this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')
    let dateTimestart = this.UTILS.dateUtils.getTimestamp(date + ' 00:00:00')
    let dateTimeEnd = this.UTILS.dateUtils.getTimestamp(date + ' 23:59:59')

    let orderItemModel = new this.MODELS.orderItemModel
    let profitModel = new this.MODELS.profitModel
    let assetsModel = new this.MODELS.assetsModel

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
    this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck items', items.length)
    if (items.length <= 0) {
      return ret
    }

    let userGroupList = await assetsModel.getUserGroup(date)
    this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck userGroupList', userGroupList[0].length, userGroupList[1].length, userGroupList[2].length)

    let itemIds = []
    for (let index = 0; index < items.length; index++) {

      let item = items[index];
      this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck item', item.id)

      try {
        item.profit_day_status = 1
        let itemUpdate = await item.save()
        if (!itemUpdate) {
          throw new Error('更新订单数据失败')
        }

        let itemProfit = (item.price - item.price_cost) * item.num
        let itemProfitPlatform = parseInt(itemProfit * 10 / 100)
        let itemProfitUser = 0
        if (item.package_level) {
          itemProfitUser = parseInt(itemProfit * 50 / 100)
        }
        let itemProfitSell = parseInt((itemProfit - itemProfitUser - itemProfitPlatform) * 30 / 100)
        this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck itemProfit', itemProfit)
        this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck itemProfitPlatform', itemProfitPlatform)
        this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck itemProfitSell', itemProfitSell)

        let profitPlatformGroup0 = parseInt(itemProfitPlatform * 20 / 100)
        let profitPlatformGroup1 = parseInt(itemProfitPlatform * 35 / 100)
        let profitPlatformGroup2 = itemProfitPlatform - profitPlatformGroup0 - profitPlatformGroup1
        let profitPlatformGroup = [profitPlatformGroup0, profitPlatformGroup1, profitPlatformGroup2]
        this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck profitPlatformGroup', profitPlatformGroup)

        for (let index1 = 0; index1 < profitPlatformGroup.length; index1++) {
          let profitPlatformGroupItem = profitPlatformGroup[index1];
          let userGroupItems = userGroupList[index1]
          this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck userGroupItems', userGroupItems)
          if (userGroupItems.length) {
            let profitUser = parseInt(profitPlatformGroupItem / userGroupItems.length)
            this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck profitUser', profitUser)
            for (let indexU = 0; indexU < userGroupItems.length; indexU++) {

              let t = await profitModel.getTrans()
              let opts = {
                transaction: t
              }
              let userId = userGroupItems[indexU];
              this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck profitUser', userId, profitUser)
              let profitCreateRet = await this._createByDay({
                date: date,
                amount: profitUser,
                user_id: userId
              }, {
                code: 0,
                message: ''
              }, opts)
              if (profitCreateRet.code) {
                this.LOG.error(args.uuid, '/dayJobProfitPlatformCheck profitCreateRet', profitCreateRet)
                await t.rollback()
                // throw new Error('添加用户收益数据失败')
              } else {
                await t.commit()
              }

            }
          } else {
            this.LOG.info(args.uuid, '/dayJobProfitPlatformCheck userGroupItems 0:', index)
          }

        }

        itemIds.push(item.id)
      } catch (err) {
        console.error(err)
        this.LOG.error(args.uuid, '/dayJobProfitPlatformCheck err', err.message)
      }

    }

    ret.data = itemIds
    return ret

  }
  /**
   * 创建每日返利
   * @param {*} args 
   * @param {*} ret 
   */
  async _createByDay(args, ret, opts = {}) {
    this.LOG.info(args.uuid, '/createByDay', args)
    let userId = args.user_id
    let amount = args.amount || 0
    if (amount <= 0) {
      ret.code = 1
      ret.message = 'param error'
      return ret
    }

    let date = args.date || this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')
    let profitModel = new this.MODELS.profitModel
    let assetsModel = new this.MODELS.assetsModel

    let profit = await profitModel.model().findOne({
      where: {
        user_id: userId,
        type: 2,
        date: date
      }
    })

    if (profit) {
      profit.amount = profit.amount + amount
      await profit.save(opts)
    } else {
      profit = await profitModel.model().create({
        user_id: args.user_id,
        type: 2,
        date: date,
        amount: amount,
        order_id: 0,
        goods_id: 0,
        status: 1
      }, opts)
    }



    if (!profit) {
      ret.code = 1
      ret.message = '创建失败'
      return ret
    }

    let t = opts.transaction || null
    let assetsRet = await assetsModel.logCharge(userId, amount, t, true)
    if (!assetsRet) {
      ret.code = 1
      ret.message = '添加用户收益数据失败'
      return ret
    }

    ret.data = profit
    return ret
  }

  /**
   * 每日结算的列表
   * @param {*} args 
   * @param {*} ret 
   */
  async listByDate(args, ret) {
    this.LOG.info(args.uuid, '/updateItem', args)
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
  async updateItemStatus(args, ret, t = null) {
    this.LOG.info(args.uuid, '/updateItem', args)
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

module.exports = ProfitController