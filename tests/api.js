const Api = require('./../app/api/index')

Api.getParentUser({user_id: 'ce02d260-736e-4284-b9a3-b8c78cee9b5b'}).then(ret => {
  console.log(ret)
})