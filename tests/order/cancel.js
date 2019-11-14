const Request = require('./../../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'
const orderId = 16
describe('order', () => {
  it('cancel', async () => {

    let uuidv4 = uuid.v4()

    let paymentCompleteRet = await request.post(DOMAIN + '/mall/order/cancel', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      id: orderId
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('payment_complete ret:')
    console.log(JSON.stringify(paymentCompleteRet, null, 2))
  })
})