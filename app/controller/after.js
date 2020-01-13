const Controller = require('../../lib/controller')
const Op = require('sequelize').Op
class AfterController extends Controller {

  _createNo() {
    let orderNo = ''
    orderNo += parseInt(Math.random() * 100000).toString()
    orderNo += this.UTILS.dateUtils.dateFormat(null, 'YYYYMMDDHHmmss')
    orderNo += parseInt(Math.random() * 100000).toString()
    return orderNo
  }

  /**
   * 售后列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let orderAfterModel = new this.MODELS.orderAfterModel
    let orderItemModel = new this.MODELS.orderItemModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      if (typeof args.status === 'object') {
        where.status = {
          [Op.in]: args.status
        }
      } else {
        where.status = args.status
      }

    }
    if (args.hasOwnProperty('business_id')) {
      where.business_id = args.business_id || 0
    }
    if (args.hasOwnProperty('user_id')) {
      where.user_id = args.user_id
    }
    if (args.hasOwnProperty('after_no')) {
      where.after_no = args.after_no
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

    let orderAfterRet = await orderAfterModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list orderAfterRet', orderRet)

    let rows = []
    for (let index = 0; index < orderAfterRet.rows.length; index++) {
      let item = orderAfterRet.rows[index];
      let orderItemId = item.order_item_id
      let orderItem = await orderItemModel.model().findByPk(orderItemId)

      item.dataValues.orderItem = orderItem
      rows.push(item)
    }

    orderAfterRet.rows = rows
    ret.data = orderAfterRet

    return ret
  }

  /**
   * 详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {
    this.LOG.info(args.uuid, '/detail', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderAfterModel = new this.MODELS.orderAfterModel
    let orderItemModel = new this.MODELS.orderItemModel

    let userId = args.user_id
    let id = args.id || 0

    let after = await orderAfterModel.model().findByPk(id)
    if (!after || after.user_id != userId) {
      ret.data = {
        after: null,
        order_item: null
      }
      return ret
    }

    let orderItemId = orderAfter.order_item_id
    let orderItem = await orderItemModel.model().findByPk(orderItemId)
    if (!orderItem) {
      ret.data = {
        after: null,
        order_item: null
      }
      return ret
    }

    ret.data = {
      after: find ? find : null,
      order_item: orderItem
    }

    return ret

  }

  /**
   * 申请信息
   * @param {*} args 
   * @param {*} ret 
   */
  async info(args, ret) {
    this.LOG.info(args.uuid, '/info', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderAfterModel = new this.MODELS.orderAfterModel
    let orderItemModel = new this.MODELS.orderItemModel

    let userId = args.user_id
    let orderItemId = args.order_item_id || args.id

    let find = await orderAfterModel.model().findOne({
      where: {
        user_id: userId,
        order_item_id: orderItemId,
        status: {
          [Op.gt]: 0
        }
      }
    })

    let orderItem = await orderItemModel.model().findByPk(orderItemId)

    ret.data = {
      after: find ? find : null,
      order_item: orderItem
    }
    return ret
  }
  /**
   * 售后申请
   * @param {*} args 
   * @param {*} ret 
   */
  async apply(args, ret) {
    this.LOG.info(args.uuid, '/create', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderAfterModel = new this.MODELS.orderAfterModel
    let orderItemModel = new this.MODELS.orderItemModel

    let userId = args.user_id
    let type = args.type || 1 // 1仅退款 2换货
    let reason = args.reason || ''
    let pics = args.pics || []
    let orderItemId = args.order_item_id || args.id
    this.LOG.info(args.uuid, '/create orderItemId', orderItemId)

    let t = await orderAfterModel.getTrans()
    let opts = {
      transaction: t
    }
    try {

      let find = await orderAfterModel.model().findOne({
        where: {
          user_id: userId,
          order_item_id: orderItemId,
          status: {
            [Op.gt]: 0
          }
        }
      })
      this.LOG.info(args.uuid, '/create find', find)
      if (find) {
        throw new Error('请不要重复申请')
      }

      let orderItem = await orderItemModel.model().findByPk(orderItemId)
      this.LOG.info(args.uuid, '/create orderItem', orderItem)
      if (!orderItem) {
        throw new Error('数据错误')
      }

      let orderItemStatus = orderItem.status
      this.LOG.info(args.uuid, '/create orderItemStatus', orderItemStatus)
      if (orderItemStatus == 0) {
        // 未付款
        throw new Error('未付款订单直接取消')
      } else if (orderItemStatus == 3) {
        // 已完成订单，超过7天不可退货
        let now = parseInt(Date.now() / 1000)

        let closeTime = orderItem.close_time
        let afterTimeLimit = closeTime + 7 * 24 * 3600
        this.LOG.info(args.uuid, '/create now', this.UTILS.dateUtils.dateFormat(now))
        this.LOG.info(args.uuid, '/create closeTime', this.UTILS.dateUtils.dateFormat(closeTime))
        this.LOG.info(args.uuid, '/create afterTimeLimit', this.UTILS.dateUtils.dateFormat(afterTimeLimit))

        if (now > closeTime && now < afterTimeLimit) {
          // 可申请换货
          if (type == 1) {
            throw new Error('超过售后退货时间，可申请换货')
          }
        } else if (now > afterTimeLimit) {
          throw new Error('超过售后时间，不可申请退换货')
        }
      }

      let createData = {}
      createData.business_id = args.business_id || 0
      createData.user_id = userId
      createData.goods_id = orderItem.goods_id
      createData.order_id = orderItem.order_id
      createData.order_item_id = orderItemId
      createData.after_no = this._createNo()
      createData.type = type
      createData.reason = reason
      createData.pics = pics.length ? JSON.stringify(pics) : ''
      createData.status = 1
      if (type == 1) {
        createData.amount = orderItem.total
      }

      let data = await orderAfterModel.model().create(createData, opts)
      if (!data) {
        throw new Error('申请失败')
      }

      orderItem.after_status = 1
      let orderItemRet = await orderItem.save(opts)
      if (!orderItemRet) {
        throw new Error('订单状态更新失败')
      }

      await t.commit()
    } catch (err) {
      console.error(err)
      await t.rollback()
      ret.code = 1
      ret.message = err.message || err

    }

    return ret

  }

  /**
   * 取消申请
   * @param {*} args 
   * @param {*} ret 
   */
  async cancel(args, ret) {
    this.LOG.info(args.uuid, '/create', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let orderAfterModel = new this.MODELS.orderAfterModel
    let orderItemModel = new this.MODELS.orderItemModel

    let userId = args.user_id
    let afterId = args.after_id || args.id

    let t = await orderAfterModel.getTrans()
    let opts = {
      transaction: t
    }

    try {

      orderAfter = await orderAfterModel.model().findByPk(afterId)
      if (!orderAfter || orderAfter.user_id != userId) {
        throw new Error('无效数据')
      }
      if (orderAfter.status !== 1) {
        throw new Error('不可取消')
      }

      orderAfter.status = -1
      orderAfter.remark = args.remark || ''
      let orderItemRetorderAfterRet = await orderAfter.save(opts)
      if (!orderAfterRet) {
        throw new Error('取消失败')
      }

      let orderItemId = orderAfter.order_item_id
      let orderItem = await orderItemModel.model().findByPk(orderItemId)
      if (!orderItem) {
        throw new Error('无效数据!')
      }

      orderItem.after_status = 0
      let orderItemRet = await orderItem.save(opts)
      if (!orderItemRet) {
        throw new Error('取消失败!')
      }

      await t.commit()
    } catch (err) {

      await t.rollback()
      ret.code = 1
      ret.message = err.message || err

    }

    return ret
  }
  /**
   * 售后审核
   * @param {*} args 
   * @param {*} ret 
   */
  async audit(args, ret) {

  }
}

module.exports = AfterController