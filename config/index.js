module.exports = {
  port: 10003,
  db: require('./db'),
  request: {
    domain: 'http://127.0.0.1:10000',
    channel_id: '886',
    key: 'qsopifkhjjgjgfossfngnjgdsknkjlkljs'
  },

  profitDayRate: [],
  withdraw: {
    card: {amount: 250 },
    message: {
      info: '您收到一张提现卡，请前往个人中心查看'
    }
  }
}