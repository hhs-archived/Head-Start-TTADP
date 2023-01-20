const { Model } = require('sequelize');
const { beforeValidate } = require('./hooks/resource');

module.exports = (sequelize, DataTypes) => {
  class Resource extends Model {
    static associate(models) {
      Resource.hasMany(models.EntityResource, { foreignKey: 'resourceId', as: 'entityResources' });
    }
  }
  Resource.init({
    domain: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    url: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
  }, {
    hooks: {
      beforeValidate: async (instance, options) => beforeValidate(sequelize, instance, options),
    },
    sequelize,
    modelName: 'Resource',
  });
  return Resource;
};
