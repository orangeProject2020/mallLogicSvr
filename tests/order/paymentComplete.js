const Request = require('./../../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'
const orderId = 20
describe('order', () => {
  it('payment_complete', async () => {
    // payemnt create
    // let paymentRet = await request.post(DOMAIN + '/mall/payment/detail', {})
    let uuidv4 = uuid.v4()
    paymentCreateRet = await request.post(DOMAIN + '/mall/payment/create', {
      "user_id": "090d668c-7388-403f-b9b7-0c3eefd665d5",
      "order_ids": [orderId],
      "total": 319800,
      "amount": 319800,
      "score": 0,
      "pay_type": 0,
      "pay_method": 0,
      "balance": 0,
      "coupon": 0,
      "user_coupon_id": 0
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    if (paymentCreateRet.code != 0) {
      console.log('payment_complete:', paymentCreateRet.message)
      return
    }

    let outTradeNo = paymentCreateRet.data.out_trade_no

    paymentCompleteRet = await request.post(DOMAIN + '/mall/payment/complete', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      out_trade_no: outTradeNo
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('payment_complete ret:')
    console.log(JSON.stringify(paymentCompleteRet, null, 2))
  })
})