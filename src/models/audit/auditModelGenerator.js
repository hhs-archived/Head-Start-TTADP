// Load in our dependencies
import { Model, DataTypes } from 'sequelize';
import httpContext from 'express-http-context';

const dmlType = ['INSERT', 'UPDATE', 'DELETE'];

// const exception = () => {
//   throw new Error(
//     'Audit log only allows reading and inserting data,'
//     + ' all modification and removal is not allowed.'
//   );
// };

const tryJsonParse = (fieldName) => {
  const data = this.getDataValue(fieldName);
  if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
    });
  }
  return data;
};

const saveAuditLog = async (action, model, options, auditModel) => {
  // Verify we are being run in a transaction
  const data = { old: [], new: [] };
  const changed = model.changed();
  if (changed instanceof Array) {
    changed.forEach((change) => {
      data.old[change] = model.previous(change);
      data.new[change] = model.getDataValue(change);
    });
  }

  if (typeof options.transaction === 'undefined' && (data.old.length !== 0 || data.new.length !== 0)) {
    throw new Error('All create/update/delete actions must be run in a transaction to '
    + 'prevent orphaned AuditLogs or connected models on save. '
    + `Please add a transaction to your current "${action}" request `
    + `Model: ${model.name}\n`
    + `${JSON.stringify(data)}`);
  }

  const contextLoggedUser = httpContext.get('loggedUser');
  const loggedUser = (typeof contextLoggedUser !== 'undefined') ? contextLoggedUser : null;

  let oldData = null;
  let newData = null;

  switch (action) {
    case 'INSERT': {
      oldData = null;
      newData = model.dataValues;
      break;
    }
    case 'UPDATE': {
      oldData = data.old;
      newData = data.new;
      break;
    }
    case 'DELETE': {
      newData = data.new;
      break;
    }
    default: {
      throw new Error(`action must be either INSERT, UPDATE, or DELETE. '${action}'`
    + `Model: ${model.name}\n`
    + `${JSON.stringify(data)}`);
    }
  }

  const auditLog = auditModel.build({
    data_id: model.dataValues.id,
    dml_type: action,
    old_row_data: oldData,
    new_row_data: newData,
    dml_timestamp: new Date(),
    dml_by: loggedUser,
    dml_txid: options.transaction ? options.transaction.id : null,
    descriptor_id: null,
  });
  return auditLog.save({ transaction: options.transaction });
};

const generateAuditModel = (sequelize, model) => {
  const auditModelName = `ZZAuditLog${model.name}`;
  const auditModel = class extends Model {
    static associate(models) {
      auditModel.belongsTo(models.User, { foreignKey: 'dml_by' });
      auditModel.belongsTo(model, { foreignKey: 'data_id' });
    }
  };

  auditModel.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
    },
    data_id: { type: DataTypes.INTEGER },
    dml_type: {
      type: DataTypes.ENUM(...dmlType),
      allowNull: false,
      validate: {
        isIn: {
          args: [...dmlType],
          msg: 'Action must be create, update, or delete',
        },
      },
    },
    old_row_data: {
      type: DataTypes.JSON,
      allowNull: true,
      get: tryJsonParse,
    },
    new_row_data: {
      type: DataTypes.JSON,
      allowNull: true,
      get: tryJsonParse,
    },
    dml_timestamp: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    dml_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
    },
    dml_txid: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: { isUUID: 'all' },
    },
    descriptor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: auditModelName,
    createdAt: false,
    updatedAt: false,
    // hooks: {
    //   beforeBulkDestroy: exception(),
    //   beforeBulkUpdate: exception(),
    //   beforeDestroy: exception(),
    //   beforeUpdate: exception(),
    //   beforeUpsert: exception(),
    // },
  });

  model.addHook('afterCreate', (instance, options) => saveAuditLog('INSERT', instance, options, auditModel));
  model.addHook('afterDestroy', (instance, options) => saveAuditLog('DELETE', instance, options, auditModel));
  model.addHook('afterUpdate', (instance, options) => saveAuditLog('UPDATE', instance, options, auditModel));
  model.addHook('afterSave', (instance, options) => saveAuditLog('UPDATE', instance, options, auditModel));
  model.addHook('afterUpsert', (instance, options) => saveAuditLog('UPDATE', instance, options, auditModel));
  model.addHook('afterBulkCreate', (instances, options) => {
    instances.forEach((instance) => saveAuditLog('INSERT', instance, options, auditModel));
  });

  return auditModel;
};

module.exports = { generateAuditModel };
