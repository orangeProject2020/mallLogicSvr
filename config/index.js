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
    card: {
      amount: 20000 // 无用
    },
    amounts: [20000, 100000, 200000, 350000],
    message: {
      info: '您的提现限制已增加，请前往个人中心查看'
    }
  }
}