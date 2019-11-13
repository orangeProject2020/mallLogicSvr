const Controller = require('../../lib/controller')

class OrderController extends Controller {

  _createOrderNo(args, ret) {
    let orderNo = ''
    orderNo += parseInt(Math.random() * 100000).toString()
    orderNo += this.UTILS.dateUtils.dateFormat(null, 'YYYYMMDDHHiiss')
    orderNo += parseInt(Math.random() * 100000).toString()
    return orderNo
  }
  /**
   * 生成订单
   * @param {*} args 
   * @param {*} ret 
   */
  async create(args, ret) {
    this.LOG.info(args.uuid, 'create', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let userId = args.user_id
    let orders = args.orders
    let address = args.address || ''
    let remark = args.remark || ''


    let orderModel = new this.MODELS.orderModel
    let orderItemModel = new this.MODELS.orderItemModel
    let goodsModel = new this.MODELS.goodsModel

    let t = await orderModel.getTrans()
    let opts = {
      transaction: t
    }

    try {
      let retData = []
      let scoreTotal = 0

      for (let index = 0; index < orders.length; index++) {
        let orderInfo = orders[index]
        let businessId = orderInfo.business_id || 0
        let remarkOrder = orderInfo.remark || remark || ''
        let score = orderInfo.score || 0 // 使用积分
        scoreTotal += score

        let orderData = {
          business_id: businessId,
          user_id: userId,
          order_no: this._createOrderNo(args, ret),
          address: address ? JSON.stringify(address) : '',
          remark: remarkOrder
        }
        let order = await orderModel.model().create(orderData)
        if (!order) {
          throw new Error('creste order error')
        }
        let orderId = order.id
        let orderRetData = order.dataValues
        orderRetData.items = []

        let items = orderInfo.goods_items || []
        let scoreUse = 0 // 积分使用
        let orderTotal = 0 // 订单金额

        for (let index1 = 0; index1 < items.length; index1++) {
          let item = items[index1]

          let goodsId = item.goods_id
          let num = item.num

          let goods = await goodsModel.model().findByPk(goodsId)
          if (!goods || goods.business_id != businessId) {
            throw new Error('goods error')
          }
          let goodsPrice = goods.price
          let goodsScore = goods.score
          orderTotal += parseInt(goodsPrice * num)

          // 判断库存
          if (goods.stock > 0) {
            if (goods.stock < num) {
              throw new Error('goods stock error')
            } else {
              // 减去库存
              goods.stock = goods.stock - num
              let goodsUpdateRet = await goods.save(opts)
              if (!goodsUpdateRet) {
                throw new Error('goods stock update error')
              }
            }
          }

          let itemData = {}
          itemData.business_id = businessId
          itemData.user_id = userId
          itemData.order_id = orderId
          itemData.goods_id = goodsId
          itemData.num = num
          itemData.price = goods.price
          itemData.price_cost = goods.price_cost
          itemData.name = goods.name
          itemData.cover = goods.cover
          itemData.type = goods.type
          itemData.score = goods.score || 0
          itemData.total = goodsPrice * num

          let orderItem = await orderItemModel.model().create(itemData, opts)
          if (!orderItem) {
            throw new Error('order item create error')
          }

          orderRetData.items.push(orderItem.dataValues)

          scoreUse += goodsScore
        }

        if (score > 0 && score < scoreUse) {
          if (score != scoreUse) {
            // 使用积分信息
            throw new Error('score error')
          }
        }

        order.total = orderTotal - score
        order.score = score

        let orderUpdateRet = await order.save(opts)
        if (!orderUpdateRet) {
          throw new Error('order update error')
        }

        orderRetData.total = order.total
        orderRetData.score = order.score

        retData.push(orderRetData)

      }

      if (scoreTotal > 0) {
        // TODO 减去用户积分
      }

      ret.data = {
        orders: retData
      }
      t.commit()
    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, 'create', err)
      ret.code = 1
      ret.message = err.message || err
      t.rollback()
    }

    return ret

  }

  /**
   * 取消订单
   * @param {*} args 
   * @param {*} ret 
   */
  async cancel(args, ret) {
    this.LOG.info(args.uuid, '/cancel', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    // let orderModel = new this.MODELS.orderModel
    // let orderItemModel = new this.MODELS.orderItemModel
    let goodsModel = new this.MODELS.goods_id

    let t = await goodsModel.getTrans()
    let opts = {
      transaction: t
    }

    let orderId = args.order_id || args.id || 0
    let status = -1
    try {
      if (!orderId) {
        throw new Error('order id error')
      }

      let updateRet = await this._updateOrderStatus(args, ret, opts, status)
      if (updateRet.code != 0) {
        throw new Error(updateRet.message)
      }

      let orderItems = args.orderItems
      for (let index = 0; index < orderItems.length; index++) {
        let item = orderItems[index];
        // 加上库存
        let goodsId = item.goods_id
        let goods = await goodsModel.findByPk(goodsId)
        if (goods.stock != -1) {
          goods.stock += item.num
          goodsRet = await goods.save(opts)
          if (!itemRet) {
            throw new Error('更新商品库存失败')
          }
        }
      }
      // let order = await orderModel.model().findByPk(orderId)
      // if (order.status != 0) {
      //   throw new Error('订单状态无法取消')
      // }

      // let orderItems = await orderItemModel.model().findAll({
      //   where: {
      //     order_id: orderId
      //   }
      // })

      // let now = parseInt(Date.now() / 1000)
      // order.status = status
      // order.cancel_time = now

      // let orderRet = order.save(opts)
      // if (!orderRet) {
      //   throw new Error('更新订单状态失败')
      // }

      // for (let index = 0; index < orderItems.length; index++) {
      //   let item = orderItems[index];
      //   item.status = status
      //   let itemRet = await item.save(opts)
      //   if (!itemRet) {
      //     throw new Error('更新订单商品状态失败')
      //   }

      //   // 加上库存
      //   let goodsId = item.goods_id
      //   let goods = await goodsModel.findByPk(goodsId)
      //   if (goods.stock != -1) {
      //     goods.stock += item.num
      //     goodsRet = await goods.save(opts)
      //     if (!itemRet) {
      //       throw new Error('更新商品库存失败')
      //     }
      //   }

      // }

      t.commit()
    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/cancel', err)
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

    let orderModel = new this.MODELS.orderModel

    let t = await orderModel.getTrans()
    let opts = {
      transaction: t
    }

    let orderId = args.order_id || args.id || 0
    let status = 1
    try {
      if (!orderId) {
        throw new Error('order id error')
      }

      let updateRet = await this._updateOrderStatus(args, ret, opts, status)
      if (updateRet.code != 0) {
        throw new Error(updateRet.message)
      }

      t.commit()
    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/cancel', err)
      ret.code = 1
      ret.message = err.message || err

      t.rollback()
    }

    return ret

  }

  /**
   * 完成收货
   * @param {*} args 
   * @param {*} ret 
   */
  async finish(args, ret) {
    this.LOG.info(args.uuid, '/finish', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderModel = new this.MODELS.orderModel

    let t = await orderModel.getTrans()
    let opts = {
      transaction: t
    }

    let orderId = args.order_id || args.id || 0
    let status = 3
    try {
      if (!orderId) {
        throw new Error('order id error')
      }

      let updateRet = await this._updateOrderStatus(args, ret, opts, status)
      if (updateRet.code != 0) {
        throw new Error(updateRet.message)
      }

      t.commit()
    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/finish', err)
      ret.code = 1
      ret.message = err.message || err

      t.rollback()
    }

    return ret

  }

  /**
   * 完成发货
   * @param {*} args 
   * @param {*} ret 
   */
  async update(args, ret) {
    this.LOG.info(args.uuid, '/update', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderModel = new this.MODELS.orderModel

    let t = await orderModel.getTrans()
    let opts = {
      transaction: t
    }

    let orderId = args.order_id || args.id || 0
    let status = args.status || 2
    try {
      if (!orderId) {
        throw new Error('order id error')
      }

      let updateRet = await this._updateOrderStatus(args, ret, opts, status)
      if (updateRet.code != 0) {
        throw new Error(updateRet.message)
      }

      t.commit()
    } catch (err) {
      console.error(err)
      this.LOG.error(args.uuid, '/update', err)
      ret.code = 1
      ret.message = err.message || err

      t.rollback()
    }

    return ret

  }

  /**
   * 订单列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let orderModel = new this.MODELS.orderModel
    let orderItemModel = new this.MODELS.orderItemModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = args.status
    }
    if (args.hasOwnProperty('business_id')) {
      where.business_id = args.business_id || 0
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
      // ['status', 'asc'],
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, '/list opts', opts)

    let orderRet = await orderModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list orderRet', orderRet)

    let rows = []
    for (let index = 0; index < orderRet.rows.length; index++) {
      let order = orderRet.rows[index];
      let orderId = order.id
      let orderItems = await orderItemModel.model().findAll({
        where: {
          order_id: orderId
        }
      })

      order.items = orderItems
      rows.push(order)
    }

    orderRet.rows = rows
    ret.data = orderRet

    return ret
  }

  /**
   * 订单详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {
    this.LOG.info(args.uuid, '/detail', args)
    let id = args.id
    let userId = args.user_id

    let orderModel = new this.MODELS.orderModel
    let orderItemModel = new this.MODELS.orderItemModel
    let order = await orderModel.model().findByPk(id)

    if (!order) {
      ret.code = 1
      ret.message = '无效订单'
      return ret
    }

    if (userId && order.user_id != userId) {
      ret.code = 1
      ret.message = '无效订单!'
      return ret
    }

    let orderItems = await orderItemModel.model().findAll({
      where: {
        order_id: order.id
      }
    })

    let resultData = order.dataValues
    resultData.items = orderItems

    ret.data = resultData
    return ret
  }

  /**
   * 更新订单
   * @param {*} args 
   * @param {*} ret 
   */
  async _updateOrderStatus(args, ret, opts, status = -1) {

    this.LOG.info(args.uuid, '/_updateOrderStatus', args)
    let orderModel = new this.MODELS.orderModel
    let orderItemModel = new this.MODELS.orderItemModel

    try {
      let order = await orderModel.model().findByPk(orderId)
      let orderItems = await orderItemModel.model().findAll({
        where: {
          order_id: orderId
        }
      })

      args.order = order.dataValues
      args.orderItems = orderItems

      let now = parseInt(Date.now() / 1000)
      order.status = status
      if (status == -1) {
        order.cancel = now
      } else if (status == 1) {
        order.payment_time = now
      } else if (status == 2) {
        order.express_time = now
      } else if (status == 3) {
        order.finish_time = now
      }

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


}

module.exports = OrderController