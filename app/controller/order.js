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

    try {
      let retData = []
      let scoreTotal = 0

      for (let index = 0; index < orders.length; index++) {
        let orderInfo = orders[index]
        let businessId = orderInfo.business_id || 0
        let score = orderInfo.score || 0 // 使用积分
        scoreTotal += score

        let orderData = {
          business_id: businessId,
          order_no: this._createOrderNo(args, ret),
          address: address ? JSON.stringify(address) : '',
          remark: remark
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
              let goodsUpdateRet = await goods.save()
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

          let orderItem = await orderItemModel.model().create(itemData)
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

        let orderUpdateRet = await order.save()
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

  }

  /**
   * 完成订单
   * @param {*} args 
   * @param {*} ret 
   */
  async complete(args, ret) {

  }

  /**
   * 订单列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {

  }

  /**
   * 订单详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {

  }

  /**
   * 更新订单
   * @param {*} args 
   * @param {*} ret 
   */
  async update(args, ret) {

  }




}

module.exports = OrderController