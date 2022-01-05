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
  function censor(censor) {
    var i = 0;

    return function(key, value) {
      if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
        return '[Circular]';

      if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
        return '[Unknown]';

      ++i; // so we know we aren't using the original object anymore

      return value;
    }
  }

  console.log('\x1b[36m%s\x1b[0m', 'Save Audit Log');
  console.log('\x1b[36m%s\x1b[0m', `action:${JSON.stringify(action)}`);
  const dataSource = { old: null, new: null };
  let result = null;
  const changed = model.changed();
  switch (action) {
    case 'INSERT': {
      dataSource.new = model.dataValues;
      break;
    }
    case 'UPDATE': {
      dataSource.old = model._previousDataValues;
      dataSource.new = model.dataValues;
      break;
    }
    case 'DELETE': {
      dataSource.old = model._previousDataValues;
      break;
    }
    default: {
      console.log('\x1b[36m%s\x1b[0m', `action:${JSON.stringify(action)}`);
      throw new Error(`action must be either INSERT, UPDATE, or DELETE. ${JSON.stringify(action)} Model: ${model.name} ${JSON.stringify(data)}`);
    }
  }
  const data = { old: {}, new: {}, cnt: 0 };
  //const changed = model.changed();
  console.log('\x1b[36m%s\x1b[0m', `changed:${JSON.stringify(changed)}`);
  let maybeChanged = 0;
  let uniqueProps = [];
  for( var prop in dataSource.old){
    if(uniqueProps.indexOf(prop) == -1){
      uniqueProps.push(prop);
    }
  }
  for( var prop in dataSource.new){
    if(uniqueProps.indexOf(prop) == -1){
      uniqueProps.push(prop);
    }
  }
  if (uniqueProps instanceof Array) {
  //if (changed instanceof Array) {
    uniqueProps.forEach((change) => {
    //Object.keys(model.dataValues).forEach((change) => {
      let oldValue = (dataSource.old) ? dataSource.old[change]: null;
      let newValue = (dataSource.new) ? dataSource.new[change]: null;
      let isEqual = ((typeof oldValue === typeof newValue) && (oldValue === newValue))
        || (oldValue === 'undefined' && (typeof newValue === 'array' || newValue instanceof Array) && newValue.length === 0);
      console.log('\x1b[36m%s\x1b[0m', `${change}: ${JSON.stringify(oldValue)} <=> ${JSON.stringify(newValue)} => ${isEqual}`);
      if (!isEqual){
        data.cnt++;
        data.old[change] = oldValue;
        data.new[change] = newValue;
      }
    });
    for(var prop in data.old){
      if( ((typeof data.old[prop] === 'array' || data.old[prop] instanceof Array) && data.old[prop].length === 0)
        || data.old[prop] === null || data.old[prop] === undefined){
        delete data.old[prop];
        console.log('\x1b[36m%s\x1b[0m', `Delete old ${prop}`);
      }
    }
    for(var prop in data.new){
      if( ((typeof data.new[prop] === 'array' || data.new[prop] instanceof Array) && data.new[prop].length === 0)
        || data.new[prop] === null || data.new[prop] === undefined){
        delete data.new[prop];
        console.log('\x1b[36m%s\x1b[0m', `Delete new ${prop}`);
      }
    }
    // data.old = JSON.stringify(data.old);
    // data.new = JSON.stringify(data.new);
  }
  console.log('\x1b[36m%s\x1b[0m', `old[${data.cnt}]:${JSON.stringify(data.old)}`);
  console.log('\x1b[36m%s\x1b[0m', `new[${data.cnt}]:${JSON.stringify(data.new)}`);
  if (data.cnt !== 0) {
    if (typeof options.transaction === 'undefined') {
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

    console.log('\x1b[36m%s\x1b[0m', `action:${JSON.stringify(action)}`);
    switch (action) {
      case 'INSERT': {
        newData = data.new;
        break;
      }
      case 'UPDATE': {
        oldData = (data.old === {})?null:data.old;
        newData = (data.new === {})?null:data.new;
        break;
      }
      case 'DELETE': {
        oldData = data.old;
        break;
      }
      default: {
        console.log('\x1b[36m%s\x1b[0m', `action:${JSON.stringify(action)}`);
        throw new Error(`!!!!! action must be either INSERT, UPDATE, or DELETE. ${JSON.stringify(action)} Model: ${model.name} ${JSON.stringify(data)}`);
      }
    }
    console.log('\x1b[36m%s\x1b[0m', ``);
    const auditLog = auditModel.build({
      data_id: model.id,
      dml_type: action,
      old_row_data: (oldData === {})?null:oldData,
      new_row_data: (newData === {})?null:newData,
      dml_timestamp: new Date(),
      dml_by: loggedUser,
      dml_txid: options.transaction ? options.transaction.id : null,
      descriptor_id: null,
    });
    result = auditLog.save({ transaction: options.transaction });
  }
  return result;
};

const generateAuditModel = (sequelize, model) => {
  const auditModelName = `ZZAuditLog${model.name}`;
  const auditModel = class extends Model {
    static associate(/* models */) {
      // auditModel.belongsTo(models.User, { foreignKey: 'dml_by' });
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
      // validate: {
      //   isIn: {
      //     args: dmlType,
      //     msg: 'Action must be create, update, or delete',
      //   },
      // },
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
