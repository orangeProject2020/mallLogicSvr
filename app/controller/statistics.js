const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class StatisticsController extends Controller {


  async list() {

  }

  async update() {
    let today = this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')
    let date = args.date || today
    let statisticsModel = new this.MODELS.statisticsModel
    let statistics = await statisticsModel.model().findOne({
      where: {
        date: date
      }
    })

    let statisticsData = await this._todayData(args, ret)

    if (statistics) {
      Object.keys(statisticsData).forEach(key => {
        statistics[key] = statisticsData[key]
      })

      await statistics.save()
    } else {
      statistics = await statisticsModel.model().create(statisticsData)
    }

    ret.data = statistics
    return ret
  }

  async today(args, ret) {
    let statisticsData = await this._todayData(args, ret)
    ret.data = statisticsData
    return ret
  }

  async _todayData(args, ret) {

    let today = this.UTILS.dateUtils.dateFormat(null, 'YYYY-MM-DD')
    let date = args.date || today
    let dateStartTimestamp = this.UTILS.dateUtils.getTimestamp(date + ' 00:00:00')
    let dateEndTimestamp = this.UTILS.dateUtils.getTimestamp(date + ' 23:59:59')

    let statisticsData = {}
    statisticsData.date = date

    let orderModel = new this.MODELS.orderModel
    let paymentModel = new this.MODELS.paymentModel
    let dateWhere = {
      [Op.gte]: dateStartTimestamp,
      [Op.lt]: dateEndTimestamp
    }
    let countCreate = await orderModel.model().count({
      where: {
        create_time: dateWhere,
        status: 0
      }
    })
    statisticsData.count_create = countCreate
    let countPayment = await orderModel.model().count({
      where: {
        payment_time: dateWhere,
        status: 1
      }
    })
    statisticsData.count_payment = countPayment
    let countComplete = await orderModel.model().count({
      where: {
        express_time: dateWhere,
        status: 2
      }
    })
    statisticsData.count_complete = countComplete
    let countFinish = await orderModel.model().count({
      where: {
        finish_time: dateWhere,
        status: 3
      }
    })
    statisticsData.count_finish = countFinish
    let countCancel = await orderModel.model().count({
      where: {
        cancel_time: dateWhere,
        status: -1
      }
    })
    statisticsData.count_cancel = countCancel

    let totalCreate = await orderModel.model().count({
      where: {
        status: {
          [Op.gte]: 0
        }
      }
    })
    statisticsData.total_create = totalCreate
    let totalPayment = await orderModel.model().count({
      where: {
        status: {
          [Op.gte]: 1
        }
      }
    })
    statisticsData.total_payment = totalPayment
    let totalComplete = await orderModel.model().count({
      where: {
        status: {
          [Op.gte]: 2
        }
      }
    })
    statisticsData.total_complete = totalComplete
    let totalFinish = await orderModel.model().count({
      where: {
        status: {
          [Op.gte]: 3
        }
      }
    })
    statisticsData.total_finish = totalFinish
    let totalCancel = await orderModel.model().count({
      where: {
        status: -1
      }
    })
    statisticsData.total_cancel = totalCancel

    let paymentCount = await paymentModel.model().sum('total', {
      where: {
        update_time: dateWhere,
        status: 1
      }
    })
    statisticsData.payment_count = paymentCount
    let paymentTotal = await paymentModel.model().sum('total', {
      where: {
        status: 1
      }
    })
    statisticsData.payment_total = paymentTotal

    return statisticsData

  }
}

module.exports = StatisticsController