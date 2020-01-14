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
          [Op.in]: [0, -1]
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
   * 发放提现卡->添加提现额度
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

    // let withdrawModel = new this.MODELS.withdrawModel
    // let createRet = await withdrawModel.model().create({
    //   user_id: userId,
    //   amount: amount,
    //   status: 0
    // })
    let assetsModel = new this.MODELS.assetsModel
    let logRet = await assetsModel.logWithdrawAdd(userId, amount, null)

    if (!logRet) {
      ret.code = 1
      ret.message = '添加提现额度失败'
    }

    return ret
  }

  /**
   * 申请提现
   * @param {*} args 
   * @param {*} ret 
   */
  async apply(args, ret) {
    this.LOG.info(args.uuid, '/apply', args)
    let checkUserRet = await this._checkUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }
    // let id = args.id
    let userId = args.user_id
    let amount = args.amount
    let name = args.name || ''
    let withdrawModel = new this.MODELS.withdrawModel
    let assetsModel = new this.MODELS.assetsModel

    // let withdraw = await withdrawModel.model().findByPk(id)
    // if (withdraw.status == -1) {
    //   withdraw.status = 0
    // }
    // if (!withdraw || withdraw.status !== 0 || withdraw.user_id != userId) {
    //   ret.code = 1
    //   ret.message = '无效数据'
    //   return ret
    // }

    // 用户资产
    let userAssets = await assetsModel.getItemByUserId(userId)
    let withdrawCountLimit = (userAssets.balance > userAssets.withdraw) ? userAssets.withdraw : userAssets.balance
    if (withdrawCountLimit <= 0) {
      ret.code = 1
      ret.message = '提现金额为0'
      return ret
    }
    // 提现中
    let withdrawAmountApply = await withdrawModel.model().sum('amount', {
      where: {
        user_id: userId,
        status: 1
      }
    })
    withdrawAmountApply = withdrawAmountApply || 0
    this.LOG.info(args.uuid, '/apply withdrawAmountApply：', withdrawAmountApply)
    let userAssetsBalance = withdrawCountLimit - withdrawAmountApply
    this.LOG.info(args.uuid, '/apply userAssetsBalance', userAssetsBalance)

    if (amount < this.CONFIG.withdraw.amountMin || userAssetsBalance < this.CONFIG.withdraw.amountMin) {
      ret.code = 1
      ret.message = '提现金额小于最低提现额度'
      return ret
    }

    if (amount > userAssetsBalance) {
      ret.code = 1
      ret.message = '提现金额不足'
      return ret
    }

    let withdraw = {}
    withdraw.user_id = userId
    withdraw.name = name
    withdraw.amount = amount
    withdraw.status = 1
    withdraw.apply_time = parseInt(Date.now() / 1000)

    let createRet = await withdrawModel.model().create(withdraw)
    if (!createRet) {
      ret.code = 1
      ret.message = '申请失败'
      return ret
    }

    return ret

  }

  /**
   * 审核提现审核
   * @param {*} args 
   * @param {*} ret 
   */
  async audit(args, ret) {
    this.LOG.info(args.uuid, '/audit', args)
    let checkUserRet = await this._checkAdminUser(args, ret)
    if (checkUserRet.code !== 0) {
      return checkUserRet
    }
    let id = args.id
    let status = args.hasOwnProperty('status') ? args.status : 2
    let withdrawModel = new this.MODELS.withdrawModel
    let assetsModel = new this.MODELS.assetsModel

    let t = await withdrawModel.getTrans()
    try {
      let opts = {
        transaction: t
      }
      let withdraw = await withdrawModel.model().findByPk(id)
      this.LOG.info(args.uuid, '/audit withdraw', withdraw)
      if (!withdraw || withdraw.status !== 1) {
        throw new Error('无效数据')
      }
      let userId = withdraw.user_id
      let amount = withdraw.amount

      let userAssets = await assetsModel.getItemByUserId(userId)
      this.LOG.info(args.uuid, '/audit userAssets', userAssets)

      if (amount > userAssets.balance) {
        throw new Error('金额不足')
      }

      if (status === 2) {
        // 提现操作
        args.user_ids = [withdraw.user_id]
        args.out_biz_no = withdraw.uuid
        args.amount = parseInt(amount * 99 / 100) // 1%手续费

        // TODO 先不请求接口
        // let withdrawRet = await this._withdrawToUser(args, ret)
        // if (withdrawRet.code !== 0) {
        //   throw new Error(withdrawRet.message || '提现至用户支付宝失败')
        // }

        // 记录流水
        let logRet = await assetsModel.logWithdraw(userId, withdraw.amount, t)
        this.LOG.info(args.uuid, '/audit logRet', logRet)
        if (!logRet) {
          throw new Error('记录用户提现失败')
        }
      }

      withdraw.status = status
      withdraw.audit_remark = args.remark || ''
      withdraw.audit_time = parseInt(Date.now() / 1000)
      withdraw.audit_user = args.UID || ''

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


  async _withdrawToUser(args, ret) {

    try {
      let userListRet = await this.API.getUserList(args)
      this.LOG.info(args.uuid, '/_withdrawToUser userListRet', userListRet)
      if (userListRet.code !== 0 || !userListRet.data || !userListRet.data.length) {
        throw new Error('获取提现用户失败')
      }

      let user = userListRet.data[0]
      this.LOG.info(args.uuid, '/_withdrawToUser user', user)
      if (!user || !user.alipay) {
        throw new Error('提交到用户支付宝失败')
      }

      args.account = user.alipay
      let alipayRet = await this.API.withdrawToAccountAlipay(args)
      this.LOG.info(args.uuid, '/_withdrawToUser alipayRet', alipayRet)
      if (alipayRet.code !== 0) {
        throw new Error(alipayRet.message || '提交到用户支付宝失败')
      }
    } catch (err) {
      ret.code = 1
      ret.message = err.message || err
      return ret
    }

    return ret
  }


}

module.exports = WithDrawController