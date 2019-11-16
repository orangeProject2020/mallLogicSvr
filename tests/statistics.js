const Request = require('./../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'

describe('statistics', () => {

  it('today', async () => {
    let ret = await request.post(DOMAIN + '/mall/statistics/today', {
      date: '2019-11-14'
    }, {
      uuid: uuid.v4(),
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    // console.log('userInfoRet', userUpdateRet)
    console.log('ret', JSON.stringify(ret, null, 2))
  })
})