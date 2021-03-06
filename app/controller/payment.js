const Controller = require('../../lib/controller')
const uuid = require('uuid')
const Op = require('sequelize').Op

class PaymentController extends Controller {

  /**
   * 支付下单
   * @param {*} args 
   * @param {*} ret 
   */
  async create(args, ret) {
    this.LOG.info(args.uuid, '/create', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }
    let orderIds = args.order_ids || []
    let amount = args.amount || 0
    let total = args.total || 0
    let score = args.score || 0
    let balance = args.balance || 0
    let coupon = args.coupon || 0
    let couponId = args.coupon_id || 0
    let payType = args.pay_type || 0
    let payMethod = args.pay_method || 0

    let orderModel = new this.MODELS.orderModel
    let paymentModel = new this.MODELS.paymentModel

    let t = await paymentModel.getTrans()
    let opts = {
      transaction: t
    }
    try {

      if (orderIds.length <= 0) {
        throw new Error('orderids error')
      }

      let paymentTotal = 0
      let paymentAmount = 0
      let paymentScore = 0
      for (let index = 0; index < orderIds.length; index++) {
        let orderId = orderIds[index];
        let order = await orderModel.model().findByPk(orderId)
        if (!order) {
          throw new Error('订单信息错误')
        }

        if (order.status != 0) {
          throw new Error('订单已完成支付')
        }

        paymentTotal += order.total
        paymentScore += order.score
        // paymentAmount += (order.total - order.score)
      }

      if (paymentTotal != total) {
        throw new Error('订单金额错误')
      }

      paymentAmount = paymentTotal - paymentScore - balance - coupon

      if (paymentAmount != amount) {
        throw new Error('订单待支付金额错误')
      }

      let paymentData = {}
      paymentData.user_id = args.user_id
      paymentData.order_ids = '-' + orderIds.join('-') + '-'
      paymentData.out_trade_no = uuid.v4().replace(/-/g, "")
      paymentData.total = total
      paymentData.amount = amount
      paymentData.pay_type = payType
      paymentData.pay_method = payMethod
      paymentData.score = score
      paymentData.balance = balance
      paymentData.coupon = coupon
      paymentData.remark = args.remark || ''

      // if (payType == 0) {
      //   // 线下支付，order.status - 9
      //   let orderIds = paymentData.order_ids.split('-')
      //   for (let index = 0; index < orderIds.length; index++) {
      //     let orderId = orderIds[index];
      //     if (orderId) {
      //       let order = await orderModel.model().findByPk(orderId)
      //       order.status = 9
      //       let orderRet = order.save(opts)
      //       if (!orderRet) {
      //         throw new Error('更新订单支付中状态失败')
      //       }
      //     }

      //   }
      // }

      if (paymentAmount === 0) {
        paymentData.status = 1

        let orderIds = paymentData.order_ids.split('-')
        for (let index = 0; index < orderIds.length; index++) {
          let orderId = orderIds[index];
          if (orderId) {
            let orderRet = await this._orderPaymentComplete(args, ret, orderId, opts)
            if (orderRet.code !== 0) {
              throw new Error(orderRet.message || '更新订单状态失败')
            }
          }

        }
      }

      let payment = await paymentModel.model().create(paymentData, opts)
      if (!payment) {
        throw new Error('创建支付账单失败')
      }

      t.commit()

      ret.data = payment

    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/create', err)
      ret.code = 1
      ret.message = err.message || err
      t.rollback()
    }

    return ret
  }

  /**
   * 完成支付
   * @param {*} args 
   * @param {*} ret 
   */
  async complete(args, ret) {
    this.LOG.info(args.uuid, '/complete', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let outTradeNo = args.out_trade_no || ''

    let paymentModel = new this.MODELS.paymentModel

    let t = await paymentModel.getTrans()
    let opts = {
      transaction: t
    }
    try {
      let payment = await paymentModel.model().findOne({
        where: {
          out_trade_no: outTradeNo
        }
      })

      if (payment.status != 0) {
        throw new Error('账单已支付')
      }

      payment.status = 1
      payment.remark = args.remark || ''
      payment.info = args.info ? JSON.status(args.info) : ''

      let paymentRet = await payment.save(opts)
      if (!paymentRet) {
        throw new Error('更新账单状态失败')
      }

      let orderIds = payment.order_ids.split('-')
      for (let index = 0; index < orderIds.length; index++) {
        let orderId = orderIds[index];
        if (orderId) {
          let orderRet = await this._orderPaymentComplete(args, ret, orderId, opts)
          if (orderRet.code !== 0) {
            throw new Error(orderRet.message || '更新订单状态失败')
          }
        }

      }

      // TODO 减去用户积分，余额，优惠券
      t.commit()

    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/complete', err)
      ret.code = 1
      ret.message = err.message || err
      t.rollback()
    }

    return ret

  }

  /**
   * 更新订单状态
   * @param {*} args 
   * @param {*} ret 
   * @param {*} orderId 
   * @param {*} opts 
   */
  async _orderPaymentComplete(args, ret, orderId, opts = {}, status = 1) {
    this.LOG.info(args.uuid, '/_orderPaymentComplete', args)
    let orderModel = new this.MODELS.orderModel
    let orderItemModel = new this.MODELS.orderItemModel

    try {
      let order = await orderModel.model().findByPk(orderId)
      let orderItems = await orderItemModel.model().findAll({
        where: {
          order_id: orderId
        }
      })

      let now = parseInt(Date.now() / 1000)
      order.status = status
      order.payment_time = now

      let orderRet = order.save(opts)
      if (!orderRet) {
        throw new Error('更新订单状态失败')
      }

      for (let index = 0; index < orderItems.length; index++) {
        let item = orderItems[index];
        item.status = status
        let itemRet = await item.save(opts)
        if (!itemRet) {
          throw new Error('更新订单商品状态失败')
        }
      }
    } catch (err) {
      ret.code = 1
      ret.message = err.message || err
    }

    return ret



  }

  /**
   * 支付账单列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)
    // let authRet = await this._authByToken(args, ret)
    // if (authRet.code != 0) {
    //   return authRet
    // }

    let page = args.page || 1
    let limit = args.limit || 0
    let paymentModel = new this.MODELS.paymentModel

    let where = {}
    let opts = {}
    if (args.hasOwnProperty('status')) {
      where.status = args.status
    } else {
      where.status = 1
    }
    if (args.hasOwnProperty('out_trade_no')) {
      where.out_trade_no = args.out_trade_no
    }
    if (args.hasOwnProperty('payment_id')) {
      where.id = args.payment_id
    }
    if (args.hasOwnProperty('user_id')) {
      where.user_id = args.user_id
    }

    if (args.search) {
      // let search = args.search
      // where[Op.or] = {
      //   out_trade_no: search,
      //   user_id: search,
      //   id: search
      // }
    }

    opts.where = where

    if (limit) {
      opts.offset = (page - 1) * limit
      opts.limit = limit
    }

    opts.order = [
      ['status', 'asc'],
      ['create_time', 'desc']
    ]

    let data = await paymentModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list data', data)
    ret.data = data
    return ret

  }

  /**
   * 账单详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {
    this.LOG.info(args.uuid, '/detail', args)
    let paymentModel = new this.MODELS.paymentModel

    let outTradeNo = args.out_trade_no || ''
    let id = args.id || 0

    let where = {}
    if (outTradeNo) {
      where.out_trade_no = outTradeNo
    }
    if (id) {
      where.id = id
    }

    let payment = await paymentModel.model().findOne({
      where: where
    })

    ret.data = payment
    return ret
  }
}

module.exports = PaymentController