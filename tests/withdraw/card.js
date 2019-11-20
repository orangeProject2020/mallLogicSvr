const Request = require('../../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'
// const orderId = 34
describe('withdraw', () => {
  it('card send', async () => {

    let uuidv4 = uuid.v4()

    let ret = await request.post(DOMAIN + '/mall/order/withdrawCardSent', {
      user_id: 'ce02d260-736e-4284-b9a3-b8c78cee9b5b',
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('card sent ret:')
    console.log(JSON.stringify(ret, null, 2))
  })
})