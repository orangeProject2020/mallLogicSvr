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
    if (args.date) {
      where.date = args.date
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

}

module.exports = ProfitController