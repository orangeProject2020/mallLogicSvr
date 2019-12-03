const Controller = require('../../lib/controller')

class NotifyController extends Controller {

  async alipay(args, ret) {
    this.LOG.info(args.uuid, '/alipay', args)

    let response = args.alipay_trade_wap_pay_response
    if (response.code !== '10000') {
      ret.code = 1
      return ret
    }

    let outTradeNo = response.out_trade_no

    return ret
  }


}

module.exports = NotifyController