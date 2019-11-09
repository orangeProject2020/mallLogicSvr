const Model = require('./../../lib/model')
const Sequelize = require('sequelize')

class UserModel extends Model {

  model() {
    return this.db().define(
      'user', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        create_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: parseInt(Date.now() / 1000)
        },
        update_time: {
          type: Sequelize.BIGINT(11),
          defaultValue: parseInt(Date.now() / 1000)
        },
        status: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        username: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        nickname: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        realname: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        mobile: {
          type: Sequelize.STRING(16),
          defaultValue: ''
        },
        email: {
          type: Sequelize.STRING(255),
          defaultValue: ''
        },
        sex: {
          type: Sequelize.INTEGER(2),
          defaultValue: 0
        },
        avatar: {
          type: Sequelize.STRING(255),
          defaultValue: 0
        },
        openid: {
          type: Sequelize.STRING(64),
          defaultValue: 0
        },
        mini_openid: {
          type: Sequelize.STRING(64),
          defaultValue: 0
        },
        birth: {
          type: Sequelize.BIGINT(11),
          defaultValue: 0
        },
        password: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        },
        password_admin: {
          type: Sequelize.STRING(64),
          defaultValue: ''
        }
      }, {
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
        freezeTableName: true,
        tableName: 't_user'
      }
    );
  }
}

module.exports = UserModel