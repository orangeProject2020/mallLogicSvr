const Controller = require('../../lib/controller')

class ProfitController extends Controller {

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
        where: { order_id: orderId }
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
          if (profit){
            continue
          } else {
            profit = await profitModel.model().create({
              order_id: orderId,
              goods_id: item.goods_id,
              date: dateJ,
              type: 1,
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

  }
}

module.exports = ProfitController