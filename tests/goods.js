const Request = require('./../lib/request')
const uuid = require('uuid')
let request = new Request({
  channel_id: '886',
  key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
})
const DOMAIN = 'http://127.0.0.1:10000'

describe('goods', () => {

  it('goods/create', async () => {
    let ret = await request.post(DOMAIN + '/mall/goods/create', {
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      business_id: 0,
      category_id: 1,
      sku_id: '0000003',
      name: 'air-jordan-5-island-green',
      title: 'Air Jordan V / Island Green',
      description: '在诞生将近30年后，Air Jordan V 所引发的风潮已从球场蔓延至街头，如今全新“Island Green”配色亮相，营造惬意的热带假期氛围。这款鞋忠实保留了迈克尔·乔丹和 Tinker Hatfield 精心构想的所有元素，连中底鲨鱼齿造型这样的细节都没有疏漏。优质的皮革鞋面饰有白色棕榈树和热带植物纹理，鞋舌、孔眼、侧拼接和外底上则点缀着鲜明的岛屿绿色彩，塑就清爽之感。',
      cover: 'https://c.static-nike.com/a/images/t_prod_ss/w_960,c_limit,f_auto/d3gdqud5o7bo6r7hcmbh/air-jordan-v-island-green-release-date.jpg',
      pics: ['https://c.static-nike.com/a/images/w_1536,c_limit,f_auto/q5mwbgg4zidbv2dhadjh/air-jordan-v-island-green-release-date.jpg',
        'https://c.static-nike.com/a/images/w_1536,c_limit,f_auto/ief9tlgvkwg9ljz34hks/air-jordan-v-island-green-release-date.jpg',
        'https://c.static-nike.com/a/images/w_1536,c_limit,f_auto/jgd8gx6voo04g2nuacku/air-jordan-v-island-green-release-date.jpg'
      ],
      price: 139900,
      price_market: 139900,
      price_cost: 100000,
      stock: 200,
      status: 1
    }, {
      uuid: uuid.v4(),
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    // console.log('userInfoRet', userUpdateRet)
    console.log('ret', JSON.stringify(ret, null, 2))
  })

  it('goods/update', async () => {
    let ret = await request.post(DOMAIN + '/mall/goods/update', {
      id: 8,
      user_id: '090d668c-7388-403f-b9b7-0c3eefd665d5',
      business_id: 0,
      category_id: 2,
      sku_id: '0000001',
      name: 'air-force-1-clot-game-royal',
      title: 'Nike Air Force 1 PRM / CLOT',
      description: '该鞋款配色灵感源自成长、尊重和回馈；独特的双层鞋面设计，彰显其别具一格的创意巧思。',
      cover: 'https://c.static-nike.com/a/images/t_prod_ss/w_960,c_limit,f_auto/9c8b7dc9-2ba6-456c-8319-a95203296ef8/air-force-1-clot-release-date.jpg',
      pics: ['https://c.static-nike.com/a/images/w_1536,c_limit,f_auto/v9kbee1dbxujihaxq0sj/air-force-1-clot-release-date.jpg'],
      price: 179900,
      price_market: 179900,
      price_cost: 150000,
      stock: 88,
      status: 1
    }, {
      uuid: uuid.v4(),
      timestamp: Date.now(),
      token: '257a8d4b-db61-4854-b469-96906f09d835'
    })

    // console.log('userInfoRet', userUpdateRet)
    console.log('ret', JSON.stringify(ret, null, 2))
  })

})