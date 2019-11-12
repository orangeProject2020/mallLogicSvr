const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

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
    this.LOG.info(args.uuid, '/list', args)

  }

  /**
   * 天机商品
   * @param {*} args 
   * @param {*} ret 
   */
  async create(args, ret) {
    this.LOG.info(args.uuid, '/create', args)

    let goodsModel = new this.MODELS.goodsModel
    if (!args.hasOwnProperty('business_id') || !args.sku_id) {
      ret.code = 1
      ret.message = '参数错误'
      return ret
    }

    let find = await goodsModel.model().findOne({
      where: {
        business_id: args.business_id,
        sku_id: args.sku_id,
        status: {
          [Op.gte]: 0
        }
      }
    })

    if (find) {
      ret.code = 1
      ret.message = '请不要重复添加'
      return ret
    }

    let goodsData = {}
    goodsData.business_id = args.business_id
    goodsData.category_id = args.category_id || 0
    goodsData.sku_id = args.sku_id
    goodsData.name = args.name || ''
    goodsData.title = args.title || ''
    goodsData.description = args.description || ''
    goodsData.type = args.type || 1
    goodsData.cover = args.cover || ''
    goodsData.content = args.content || ''
    goodsData.price = args.price || 0
    goodsData.price_market = args.price_market || 0
    goodsData.price_cost = args.price_cost || 0
    goodsData.price_score = args.price_score || 0
    goodsData.price_vip = args.price_vip || 0
    goodsData.stock = args.stock || -1
    goodsData.sales = args.sales || 0
    goodsData.pics = args.pics.length ? args.pics.join(',') : ''
    goodsData.sort = args.sort || 0
    goodsData.status = args.status || 0
    goodsData.create_user = args.user_id || ''

    let goods = await goodsModel.model().create(goodsData)
    if (!goods) {
      ret.code = 1
      ret.message = '添加失败'
    }

    ret.data = goods.dataValues

    return ret


  }

  /**
   * 商品编辑
   * @param {*} args 
   * @param {*} ret 
   */
  async update(args, ret) {
    this.LOG.info(args.uuid, '/update', args)

    let goodsModel = new this.MODELS.goodsModel
    if (!args.id) {
      ret.code = 1
      ret.message = '参数错误'
      return ret
    }

    let find = await goodsModel.model().findOne({
      where: {
        business_id: args.business_id,
        sku_id: args.sku_id,
        status: {
          [Op.gte]: 0
        },
        id: {
          [Op.ne]: args.id
        }
      }
    })

    if (find) {
      ret.code = 1
      ret.message = '请不要重复添加'
      return ret
    }

    let goods = await goodsModel.model().findByPk(args.id)
    if (!goods) {
      ret.code = 1
      ret.message = '无效数据'
      return ret
    }

    goods.update_user = args.user_id || ''
    let updateFields = ['category_id', 'sku_id', 'name', 'title', 'description', 'content', 'cover', 'pics', 'price', 'price_cost', 'price_market', 'price_score', 'price_vip', 'stock', 'sales', 'sort', 'status']
    updateFields.forEach(item => {
      if (args.hasOwnProperty(item)) {
        goods[item] = args[item]
      }
    })

    let updateRet = await goods.save()
    if (!updateRet) {
      ret.code = 1
      ret.message = '更新失败'
      return ret
    }

    ret.data = updateRet.dataValues
    return ret
  }

}

module.exports = GoodsController