const models = require('./../app/model/index')
const utlls = require('./../utils')
const uuid = require('uuid')
const log = require('./log')
const Request = require('./request')
const config = require('./../config')

// const venders = require('./../vendor')
class Controller {

  constructor() {

    this.LOG = log(this.constructor.name)
    this.MODELS = models
    // this.VENDORS = venders
    this.UTILS = utlls
  }

  async _request(args, url, data, ret) {
    this.LOG.info(args.uuid, '_request', url, data)
    let configRequest = config.request
    let request = new Request({
      channel_id: configRequest.channel_id,
      key: configRequest.key
    })
    const DOMAIN = configRequest.domain

    let requestRet = await request.post(DOMAIN + url, data, {
      uuid: uuid.v4(),
      timestamp: Date.now(),
    })
    this.LOG.info(args.uuid, '_request', url, requestRet)
    return requestRet
  }

  async _checkUser(args, ret) {
    if (!args.user_id) {
      ret.code = -101
      ret.message = 'user error'
    }
    return ret
  }

  // async _authByToken(args, ret) {
  //   let token = args.token || ''
  //   if (!token) {
  //     ret.code = -100
  //     ret.message = 'token error'
  //     return ret
  //   }

  //   let userAuthModel = new this.MODELS.userAuthModel
  //   let userAuth = await userAuthModel.model().findOne({
  //     where: {
  //       token: token
  //     }
  //   })

  //   this.LOG.info(args.uuid, '_authByToken', userAuth)
  //   if (!userAuth) {
  //     ret.code = -100
  //     ret.message = 'token auth error'
  //     return ret
  //   }

  //   args.user_id = userAuth.user_id
  //   return ret
  // }

}

module.exports = Controller