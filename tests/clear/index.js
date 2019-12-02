const Request = require('./../../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'

describe('clear', () => {
  it('idnex', async () => {

    let uuidv4 = uuid.v4()

    let paymentCompleteRet = await request.post(DOMAIN + '/mall/clear/index', {}, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('payment_complete ret:')
    console.log(JSON.stringify(paymentCompleteRet, null, 2))
  })
})