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

    let withdrawCount = await withdrawModel.model().count({
      where: {
        user_id: userId,
        status: 0
      }
    })
    this.LOG.info(args.uuid, '/infoAssets withdrawCount:', withdrawCount)

    let assets = await assetsModel.getItemByUserId(userId)
    this.LOG.info(args.uuid, '/infoAssets assets:', assets)
    let profit = await profitModel.model().sum('amount', {
      where: {
        user_id: userId
      }
    })
    this.LOG.info(args.uuid, '/infoAssets profit:', profit)

    ret.data = {
      withdraw: withdrawCount || 0,
      balance: assets.balance || 0,
      profit: profit || 0
    }

    return ret
  }


}

module.exports = WithDrawController