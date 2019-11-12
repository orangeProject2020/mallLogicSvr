const Request = require('./../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'

describe('order', () => {

  it('order/create', async () => {
    let ret = await request.post(DOMAIN + '/mall/order/create', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      orders: [{
          business_id: 1,
          goods_items: [{
            goods_id: 1,
            num: 1
          }],
          score: 0
        },
        {
          business_id: 2,
          goods_items: [{
              goods_id: 2,
              num: 1,
            },
            {
              goods_id: 3,
              num: 2
            }
          ],
          score: 0
        }
      ],
      address: {
        name: 'lc',
        mobile: '18676669410'
      },
      remark: 'remark_test'
    }, {
      uuid: uuid.v4(),
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    // console.log('userInfoRet', userUpdateRet)
    console.log('ret', JSON.stringify(ret, null, 2))
  })

})