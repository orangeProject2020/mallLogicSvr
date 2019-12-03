const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class AssetsController extends Controller {

  /**
   * 收益列表
   * @param {}} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let assetsModel = new this.MODELS.assetsModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = status
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
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, '/list opts', opts)

    let listRet = await assetsModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list listRet', listRet)
    ret.data = listRet

    return ret
  }

  async listLogs(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let assetsModel = new this.MODELS.assetsModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = status
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
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, '/list opts', opts)

    let listRet = await assetsModel.logsModel().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list listRet', listRet)
    ret.data = listRet

    return ret
  }

}

module.exports = AssetsController