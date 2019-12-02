const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class ClearController extends Controller {

  async index(args, ret) {

    this.goods(args, ret)
    this.category(args, ret)
    this.order(args, ret)
    this.orderItem(args, ret)
    this.payment(args, ret)
    this.profit(args, ret)
    this.withdraw(args, ret)
    this.assest(args, ret)

    return ret

  }

  async goods(args, ret) {
    let goodsModel = new this.MODELS.goodsModel()
    let goodsRet = await goodsModel.model().destroy({
      where: {
        status: {
          [Op.lt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear goods goodsRet', goodsRet)

    return ret
  }

  async category(args, ret) {
    let model = new this.MODELS.categoryModel()
    let clearRet = await model.model().destroy({
      where: {
        status: {
          [Op.lt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear category clearRet', clearRet)

    return ret
  }

  async order(args, ret) {
    let model = new this.MODELS.orderModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear order clearRet', clearRet)

    return ret
  }

  async orderItem(args, ret) {
    let model = new this.MODELS.orderItemModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear orderItem clearRet', clearRet)

    return ret
  }

  async payment(args, ret) {
    let model = new this.MODELS.paymentModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear payment clearRet', clearRet)

    return ret
  }

  async profit(args, ret) {
    let model = new this.MODELS.profitModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear profit clearRet', clearRet)

    return ret
  }

  async withdraw(args, ret) {
    let model = new this.MODELS.withdrawModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear withdraw clearRet', clearRet)

    return ret
  }


  async assest(args, ret) {
    let model = new this.MODELS.assetsModel()
    let clearRet = await model.model().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    let clearRet1 = await model.logsModel().destroy({
      where: {
        id: {
          [Op.gt]: 0
        }
      }
    })
    this.LOG.info(args.uuid, 'clear assest clearRet', clearRet)
    this.LOG.info(args.uuid, 'clear assest log clearRet', clearRet1)

    return ret
  }
}

module.exports = ClearController