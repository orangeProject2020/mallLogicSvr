const Model = require('../../lib/model')
const Sequelize = require('sequelize')

class CollectModel extends Model {

  model() {
    return this.db().define(
      'collect', {
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
      user_id: {
        type: Sequelize.STRING(64),
        defaultValue: ''
      },
      goods_id: {
        type: Sequelize.BIGINT(20),
        defaultValue: 0
      },

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_collect'
    }
    );
  }
  
}

module.exports = CollectModel