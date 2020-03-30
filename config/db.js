module.exports = process.env.NODE_ENV === 'production' ? {
  host: 'localhost',
  port: 3306,
  dbname: 'db_mall',
  username: 'root',
  password: 'Sbwd_2020',
  maxLimit: 1000,
} : {
  host: '59939c0a9a983.gz.cdb.myqcloud.com',
  port: 5579,
  dbname: '2020_mall_demo',
  username: 'huaweiyun',
  password: 'huaweiyun_2020',
  maxLimit: 1000,
}