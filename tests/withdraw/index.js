const Request = require('../../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'
// const orderId = 34
describe('withdraw', () => {
  it('list', async () => {

    let uuidv4 = uuid.v4()

    let ret = await request.post(DOMAIN + '/mall/withdraw/list', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      status: 0
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('list ret:')
    console.log(JSON.stringify(ret, null, 2))
  })

  // it('apply', async () => {

  //   let uuidv4 = uuid.v4()

  //   let ret = await request.post(DOMAIN + '/mall/withdraw/apply', {
  //     user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
  //     id : 2
  //   }, {
  //     uuid: uuidv4,
  //     timestamp: Date.now(),
  //     token: '257a8d4b-db61-4854-b469-96906f09d835'
  //   })

  //   console.log('apply ret:')
  //   console.log(JSON.stringify(ret, null, 2))
  // })

  it('audit', async () => {

    let uuidv4 = uuid.v4()

    let ret = await request.post(DOMAIN + '/mall/withdraw/audit', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      id : 2,
      status: -1
    }, {
      uuid: uuidv4,
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    console.log('audit ret:')
    console.log(JSON.stringify(ret, null, 2))
  })
})