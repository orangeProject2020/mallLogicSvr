const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class WithDrawController extends Controller {

  /**
   * 提现列表
   * @param {*} args 
   * @param {*} ret 
   */
  async infoAssets(args, ret) {
    this.LOG.info(args.uuid, '/infoAssets', args)

    let withdrawModel = new this.MODELS.withdrawModel
    let assetsModel = new this.MODELS.assetsModel
    let profitModel = new this.MODELS.profitModel

    let userId = args.user_id

    // let withdrawCount = await withdrawModel.model().count({
    //   where: {
    //     user_id: userId,
    //     status: 0
    //   }
    // })
    // this.LOG.info(args.uuid, '/infoAssets withdrawCount:', withdrawCount)

    let balance = 0
    let withdraw = 0
    let assets = await assetsModel.getItemByUserId(userId)
    this.LOG.info(args.uuid, '/infoAssets assets:', assets)
    let profit = await profitModel.model().sum('amount', {
      where: {
        user_id: userId
      }
    })
    this.LOG.info(args.uuid, '/infoAssets profit:', profit)
    let withdrawApplySum = await withdrawModel.model().sum('amount', {
      where: {
        user_id: userId,
        status: 1
      }
    })
    withdrawApplySum = withdrawApplySum || 0
    this.LOG.info(args.uuid, '/infoAssets withdrawApplySum:', withdrawApplySum)
    balance = assets.balance - withdrawApplySum
    balance = (balance > 0) ? balance : 0

    withdraw = assets.withdraw - withdrawApplySum
    withdraw = (withdraw > 0) ? withdraw : 0

    ret.data = {
      withdraw: withdraw || 0,
      balance: balance || 0,
      profit: profit || 0
    }

    return ret
  }

  async infoOrders(args, ret) {
    this.LOG.info(args.uuid, '/infoAssets', args)

    let orderModel = new this.MODELS.orderModel

    let userId = args.user_id

    let count0 = await orderModel.model().count({
      where: {
        user_id: userId,
        status: 0
      }
    })
    let count1 = await orderModel.model().count({
      where: {
        user_id: userId,
        status: 1
      }
    })
    let count2 = await orderModel.model().count({
      where: {
        user_id: userId,
        status: 2
      }
    })

    ret.data = [count0, count1, count2]
    return ret
  }


}

module.exports = WithDrawController