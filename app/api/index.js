const Request = require('./../../lib/request')
const config = require('./../../config')
const log = require('./../../lib/log')('api')
const uuid = require('uuid')

class Api {

  constructor() {

    this.request = new Request({
      channel_id: config.request.channel_id,
      key: config.request.key
    })
    this.domian = config.request.domain

  }

  async getUserList(args) {
    let ret = await this.request.post(this.domian + '/user/data/getListByUserIds', {
      user_ids: args.user_ids
    }, {
      uuid: args.uuid || uuid.v4(),
      timestamp: Date.now(),
    })
    return ret
  }
  /**
   * 获取用户上级id
   * @param {*} args 
   */
  async getParentUser(args) {
    let ret = await this.request.post(this.domian + '/user/data/getParentUser', {
      user_id: args.user_id
    }, {
      uuid: args.uuid || uuid.v4(),
      timestamp: Date.now(),
    })
    return ret
  }

  async withdarwCardSent(args) {
    let ret = await this.request.post(this.domian + '/mall/withdraw/create', {
      user_id: args.user_id,
      amount: args.amount
    }, {
      uuid: args.uuid || uuid.v4(),
      timestamp: Date.now(),
    })
    return ret
  }

  async messageSent(args) {
    let ret = await this.request.post(this.domian + '/user/message/create', {
      user_id: args.user_id,
      info: args.info
    }, {
      uuid: args.uuid || uuid.v4(),
      timestamp: Date.now(),
    })
    return ret
  }

  async withdrawToAccountAlipay(args) {
    let ret = await this.request.post(this.domian + '/utils/alipay/toAccountTransfer', {
      out_biz_no: args.out_biz_no,
      account: args.account,
      amount: args.amount
    }, {
      uuid: args.uuid || uuid.v4(),
      timestamp: Date.now(),
    })
    return ret
  }
}

module.exports = new Api