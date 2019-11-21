const Controller = require('../../lib/controller')

class NotifyController extends Controller {

  async alipay(args, ret) {
    this.LOG.info(args.uuid, '/alipay',args)

    return ret
  }


}

module.exports = NotifyController