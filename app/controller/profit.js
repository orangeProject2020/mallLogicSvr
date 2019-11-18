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
      where.user_id = args.userId
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
    ret.data = goodsRet

    return ret
  }

  /**
   * 每日收益结算
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobProfitClose(args, ret) {
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
          uuid: args.uuid,
          t: t
        }, {
          code: 0,
          message: ''
        })
        this.LOG.info(args.uuid, '/dayJobProfitClose updateRet:', updateRet)
        if (updateRet.code) {
          throw new Error(updateRet.message || `用户收益${userId}记录状态更新失败`)
        }
        await t.commit()
        len++
      } catch (err) {
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
   * 生成每日收益
   * @param {*} args 
   * @param {*} ret 
   */
  async dayJobCreateProfit(args, ret) {
    this.LOG.info(args.uuid, '/dayJobCreateProfit', args)
  }

  /**
   * 创建订单收益
   * @param {*} args 
   * @param {*} ret 
   */
  async createByOrder(args, ret) {
    this.LOG.info(args.uuid, '/createByOrder', args)
    let orderId = args.order_id || args.id || 0
    // let date = this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')

    let orderItemModel = new this.MODELS.orderItemModel
    let orderModel = new this.MODELS.orderModel
    let profitModel = new this.MODELS.profitModel

    let t = await orderModel.getTrans()
    let retData = []
    try {

      let order = await orderModel.model().findByPk(orderId)
      if (!order || order.status != 3) {
        throw new Error('订单状态错误')
      }

      let orderItems = await orderItemModel.model().findAll({
        where: {
          order_id: orderId
        }
      })

      for (let index = 0; index < orderItems.length; index++) {
        let item = orderItems[index];
        let profitTotal = (item.price - item.price_cost) * item.num // 总利润
        let profitDays = 5
        let profitAmount = parseInt(profitTotal / 2 / profitDays)

        for (let j = 0; j < profitDays; j++) {
          let dateTimestamp = parseInt(Date.now() / 1000) + j * 24 * 3600
          let dateJ = this.UTILS.dateUtils.dateFormat(dateTimestamp, 'YYYY-MM-DD')
          let profit = await profitModel.model().findOne({
            where: {
              order_id: orderId,
              goods_id: item.goods_id,
              date: dateJ
            }
          })
          if (profit) {
            continue
          } else {
            profit = await profitModel.model().create({
              order_id: orderId,
              goods_id: item.goods_id,
              date: dateJ,
              type: 1,
              user_id: order.user_id,
              amount: profitAmount
            })

            if (!profit) {
              throw new Error('记录收益失败')
            }

            retData.push(profit.id)
          }
        }

      }
      t.commit()
    } catch (err) {
      ret.code = 1
      ret.message = err.message || 'createByOrder error'
      t.rollback()
    }

    ret.data = retData

    return ret
  }

  /**
   * 创建每日返利
   * @param {*} args 
   * @param {*} ret 
   */
  async createByDay(args, ret) {
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

    let profit = await profitModel.model().findOne({
      where: {
        user_id: userId,
        type: 2,
        date: date
      }
    })

    if (profit) {
      ret.code = 1
      ret.message = '已创建'
      return ret
    }

    profit = await profitModel.model().create({
      user_id: args.user_id,
      type: 2,
      date: date,
      amount: amount,
      order_id: 0,
      goods_id: 0
    })

    if (!profit) {
      ret.code = 1
      ret.message = '创建失败'
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

    let list = await profitModel.model().findOne({
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
  async updateItemStatus(args, ret) {
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
    if (args.t) {
      opts.transaction = t
    }

    profit.status = 1
    await profit.save(opts)

    return ret
  }
}

module.exports = ProfitController