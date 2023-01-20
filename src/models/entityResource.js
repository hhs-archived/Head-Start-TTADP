const { Model } = require('sequelize');
const { ENTITY_TYPES, SOURCE_FIELD } = require('../constants');
// const { beforeDestroy, afterDestroy } = require('./hooks/activityReportResource');

module.exports = (sequelize, DataTypes) => {
  class EntityResource extends Model {
    static associate(models) {
      EntityResource.belongsTo(models.Resource, { foreignKey: 'resourceId', as: 'resource' });
      EntityResource.belongsTo(models.ActivityReport, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.REPORT,
        },
        foreignKey: 'entityId',
        as: 'report',
        hooks: true,
      });
      EntityResource.belongsTo(models.ActivityReportGoal, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.REPORTGOAL,
        },
        foreignKey: 'entityId',
        as: 'reportGoal',
        hooks: true,
      });
      EntityResource.belongsTo(models.ActivityReportObjective, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.REPORTOBJECTIVE,
        },
        foreignKey: 'entityId',
        as: 'reportObjective',
        hooks: true,
      });
      EntityResource.belongsTo(models.NextStep, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.NEXTSTEP,
        },
        foreignKey: 'entityId',
        as: 'nextstep',
        hooks: true,
      });
      EntityResource.belongsTo(models.Goal, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.GOAL,
        },
        foreignKey: 'entityId',
        as: 'goal',
        hooks: true,
      });
      EntityResource.belongsTo(models.GoalTemplate, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.GOALTEMPLATE,
        },
        foreignKey: 'entityId',
        as: 'goalTemplate',
        hooks: true,
      });
      EntityResource.belongsTo(models.Objective, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.OBJECTIVE,
        },
        foreignKey: 'entityId',
        as: 'objective',
        hooks: true,
      });
      EntityResource.belongsTo(models.ObjectiveTemplate, {
        scope: {
          '$EntityResource.entityType$': ENTITY_TYPES.OBJECTIVETEMPLATE,
        },
        foreignKey: 'entityId',
        as: 'objectiveTemplate',
        hooks: true,
      });
    }
  }
  EntityResource.init({
    entityType: {
      allowNull: false,
      default: null,
      type: DataTypes.ENUM(Object.values(ENTITY_TYPES)),
    },
    entityId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    resourceId: {
      type: DataTypes.INTEGER,
    },
    sourceFields: {
      allowNull: true,
      default: null,
      type: DataTypes.ARRAY(DataTypes.ENUM(Object.values(SOURCE_FIELD.REPORT))),
    },
    isAutoDetected: {
      type: DataTypes.BOOLEAN,
      default: false,
      allowNull: false,
    },
    onAR: {
      type: DataTypes.BOOLEAN,
      default: false,
      allowNull: true,
    },
    onApprovedAR: {
      type: DataTypes.BOOLEAN,
      default: false,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'EntityResource',
    // hooks: {
    //   beforeDestroy: async (instance, options) => beforeDestroy(sequelize, instance, options),
    //   afterDestroy: async (instance, options) => afterDestroy(sequelize, instance, options),
    // },
  });
  return EntityResource;
};
