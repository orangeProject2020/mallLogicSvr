const Controller = require('../../lib/controller')
const Op = require('sequelize').Op

class WithDrawController extends Controller {

  /**
   * 提现列表
   * @param {*} args 
   * @param {*} ret 
   */
  async list(args, ret) {
    this.LOG.info(args.uuid, '/list', args)

    let withdrawModel = new this.MODELS.withdrawModel
    let where = {}
    let opts = {}

    if (args.hasOwnProperty('status')) {
      if (args.status === 0) {
        where.status = {
          [Op.in]:[0,-1]
        }
      } else {
        where.status = args.status
      }
      
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

    let withdrawRet = await withdrawModel.model().findAndCountAll(opts)
    this.LOG.info(args.uuid, '/list withdrawRet', withdrawRet)
    ret.data = withdrawRet

    return ret
  }

  /**
   * 发放提现卡
   * @param {*} args 
   * @param {*} ret 
   */
  async create(args, ret) {
    this.LOG.info(args.uuid, '/create', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }

    let userId = args.user_id
    let amount = args.amount

    let withdrawModel = new this.MODELS.withdrawModel
    let createRet = await withdrawModel.model().create({
      user_id: userId,
      amount: amount,
      status: 0
    })

    ret.data = createRet
    return ret
  }

  /**
   * 申请提现
   * @param {*} args 
   * @param {*} ret 
   */
  async apply(args, ret) {
    this.LOG.info(args.uuid, '/apply', args)
    let id = args.id
    let userId = args.user_id
    let withdrawModel = new this.MODELS.withdrawModel
    let assetsModel = new this.MODELS.assetsModel

    let withdraw = await withdrawModel.model().findByPk(id)
    if (withdraw.status == -1){
      withdraw.status = 0
    }
    if (!withdraw || withdraw.status !== 0 || withdraw.user_id != userId){
      ret.code = 1
      ret.message = '无效数据'
      return ret
    }
    
    // 用户资产
    let userAssets = await assetsModel.getItemByUserId(userId)
    // 提现中
    let withdrawAmountApply = await withdrawModel.model().sum('amount', {
      where: {
        user_id: userId,
        status: 1
      }
    }) 
    let userAssetsBalance = userAssets.balance - withdrawAmountApply

    if (withdraw.amount > userAssetsBalance) {
      ret.code = 1
      ret.message = '提现金额不足'
      return ret
    }

    withdraw.status = 1
    withdraw.apply_time = parseInt(Date.now()/ 1000)

    let updateRet = await withdraw.save()
    if (!updateRet) {
      ret.code = 1
      ret.message = '申请失败'
      return ret
    }

    return ret

  }

  /**
   * 审核提现
   * @param {*} args 
   * @param {*} ret 
   */
  async audit(args, ret) {
    this.LOG.info(args.uuid, '/audit', args)
    let id = args.id
    let status = args.status || 2
    let withdrawModel = new this.MODELS.withdrawModel
    let assetsModel = new this.MODELS.assetsModel
    
    let t = await withdrawModel.getTrans()
    try {
      let opts = {
        transaction: t
      }
      let withdraw = await withdrawModel.model().findByPk(id)
      this.LOG.info(args.uuid, '/audit withdraw', withdraw)
      if (!withdraw || withdraw.status !== 1){
        throw new Error('无效数据')
      }
      let userId = withdraw.user_id
      let amount = withdraw.amount

      let userAssets = await assetsModel.getItemByUserId(userId)
      this.LOG.info(args.uuid, '/audit userAssets', userAssets)
      if (amount > userAssets.balance){
        throw new Error('金额不足')
      }

      if (status === 2) {
        // TODO 提现操作

        // 记录流水
        let logRet = await assetsModel.logWithdraw(userId, withdraw.amount, t)
        this.LOG.info(args.uuid, '/audit logRet', logRet)
        if (!logRet) {
          throw new Error('记录用户提现失败')
        }
      } 

      withdraw.status = status
      withdraw.audit_remark = args.remark || ''
      withdraw.audit_time = parseInt(Date.now()/ 1000)
      withdraw.audit_user = args.user_id || ''

      let updateRet = await withdraw.save(opts)
      this.LOG.info(args.uuid, '/audit updateRet', updateRet)
      if (!updateRet) {
        throw new Error('更新数据失败')
      }
      t.commit()

    } catch (err) {
      console.error(err)
      ret.code = 1
      ret.message = err.message 
      t.rollback()
      return ret
    }

    return ret
  }

  
}

module.exports = WithDrawController