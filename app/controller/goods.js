const Controller = require('../../lib/controller')

class GoodsController extends Controller {

  /**
   * 类别
   * @param {*} args 
   * @param {*} ret 
   */
  async categorys(args, ret) {

    this.LOG.info(args.uuid, 'categorys', args)

    let categoryModel = new this.MODELS.categoryModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = 1
    }
    if (args.hasOwnProperty('business_id')) {
      where.business_id = args.business_id || 0
    }

    opts.where = where

    let page = args.page || 1
    let limit = args.limit || 0

    if (limit) {
      opts.offset = (page - 1) * limit
      opts.limit = limit
    }

    opts.order = [
      ['sort', 'asc'],
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, 'categorys opts', opts)

    let categorysRet = await categoryModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, 'categorys categorysRet', categorysRet)
    ret.data = categorysRet

    return ret
  }

  /**
   * 类别更新
   * @param {*} args 
   * @param {*} ret 
   */
  async categoryUpdate(args, ret) {

  }

  /**
   * 商品列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let goodsModel = new this.MODELS.goodsModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      where.status = 1
    }
    if (args.hasOwnProperty('business_id')) {
      where.business_id = args.business_id || 0
    }
    if (args.hasOwnProperty('category_id')) {
      where.category_id = args.category_id
    }

    opts.where = where

    let page = args.page || 1
    let limit = args.limit || 0

    if (limit) {
      opts.offset = (page - 1) * limit
      opts.limit = limit
    }

    opts.order = [
      ['sort', 'asc'],
      ['create_time', 'desc']
    ]
    this.LOG.info(args.uuid, '/list opts', opts)

    let goodsRet = await goodsModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list categorysRet', goodsRet)
    ret.data = goodsRet

    return ret
  }

  /**
   * 商品详情
   * @param {*} args 
   * @param {*} ret 
   */
  async detail(args, ret) {

  }

  /**
   * 商品编辑
   * @param {*} args 
   * @param {*} ret 
   */
  async update(args, ret) {

  }

}

module.exports = GoodsController