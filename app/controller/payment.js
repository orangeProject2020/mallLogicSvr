const Controller = require('../../lib/controller')

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
        let orderId = array[index];
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
      paymentData.out_trade_no = uuid.v4().eplace(/-/g, "")
      paymentData.total = total
      paymentData.amount = amount
      paymentData.pay_type = payType
      paymentData.pay_method = payMethod
      paymentData.score = score
      paymentData.balance = balance
      paymentData.coupon = coupon

      if (payType == 0) {
        // 线下支付，order.status - 9
        let orderIds = payment.order_ids.split('-')
        for (let index = 0; index < orderIds.length; index++) {
          let orderId = orderIds[index];
          if (orderId) {
            let order = await orderModel.model().findByPk(orderId)
            order.status = 9
            let orderRet = order.save(opts)
            if (!orderRet) {
              throw new Error('更新订单支付中状态失败')
            }
          }

        }
      }

      if (paymentAmount === 0) {
        paymentData.status = 1

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
      payment.info = args.info ? JSON.status(args.info) : ''

      paymentRet = await payment.save(opts)
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

    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/complete', err)
      ret.code = 1
      ret.message = err.message || err
      t.rollback()
    }

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

  }

  /**
   * 账单详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {

  }
}

module.exports = PaymentController