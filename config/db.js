module.exports = process.env.NODE_ENV === 'production' ? {
  host: '127.0.0.0',
  port: 3306,
  dbname: 'db_mall',
  username: 'root',
  password: 'sbwd2020',
  maxLimit: 1000,
} : {
  host: '59939c0a9a983.gz.cdb.myqcloud.com',
  port: 5579,
  dbname: '2020_huaweiyun_demo',
  username: 'huaweiyun',
  password: 'huaweiyun_2020',
  maxLimit: 1000,
}