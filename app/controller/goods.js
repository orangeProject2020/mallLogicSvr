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
      where.status = args.status
    } else {
      where.status = {
        [Op.gte]: 0
      }
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
    this.LOG.info(args.uuid, 'categorys', args)

    let categoryModel = new this.MODELS.categoryModel
    let data = {}
    data.id = args.id || 0
    data.business_id = args.business_id || 0
    data.name = args.name || ''
    data.title = args.title || ''
    data.sort = args.sort || 0
    data.status = args.status || 0
    if (data.id) {
      let category = await categoryModel.model().findByPk(data.id)
      if (!category) {
        ret.code = 1
        ret.message = '无效数据'
        return ret
      }

      category.name = data.name
      category.title = data.title
      category.status = data.status
      category.sort = data.sort
      category.business_id = data.business_id
      await category.save()
    } else {
      let category = await categoryModel.model().create(data)
      if (!category) {
        ret.code = 1
        ret.message = '添加失败'
        return ret
      }
    }

    return ret
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
      where.status = args.status
    } else {
      where.status = {
        [Op.gte]: 0
      }
    }
    if (args.hasOwnProperty('business_id')) {
      where.business_id = args.business_id || 0
    }
    if (args.hasOwnProperty('category_id')) {
      where.category_id = args.category_id
    }
    if (args.recommend) {
      where.is_recommend = 1
    }
    if (args.new) {
      where.is_new = 1
    }
    if (args.package) {
      where.package_level = {
        [Op.gt]: 0
      }
    }
    if (args.type_sub) {
      where.type_sub = args.type_sub
    }
    if (args.search) {
      where.title = {
        [Op.like]: '%' + args.search + '%'
      }
    }

    opts.where = where

    let page = args.page || 1
    let limit = args.limit || 0

    if (limit) {
      opts.offset = (page - 1) * limit
      opts.limit = limit
    }

    let order = []
    if (args.order && typeof args.order === 'object') {
      order.push(args.order)
    }
    order.push(['sort', 'asc'])
    order.push(['update_time', 'desc'])
    opts.order = order
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
    let goodsModel = new this.MODELS.goodsModel

    let id = args.id
    let goods = await goodsModel.model().findByPk(id)
    ret.data = goods

    return ret
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
    goodsData.thumb = args.thumb || ''
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
    goodsData.package_level = args.package_level || 0
    goodsData.package_profit = args.package_profit || 0
    goodsData.is_recommend = args.is_recommend || 0
    goodsData.is_new = args.is_new || 0
    goodsData.type_sub = args.type_sub || 0
    goodsData.status = args.status || 0

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
    let updateFields = ['category_id', 'sku_id', 'name', 'title', 'description', 'content', 'cover', 'thumb', 'pics', 'price', 'price_cost', 'price_market', 'price_score', 'price_vip', 'stock', 'sales', 'sort', 'status', 'package_level', 'package_profit', 'is_recommend', 'is_new', 'type_sub', 'status']
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