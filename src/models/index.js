const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];
const audit = require('./audit/auditModelGenerator');

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    const auditModel = audit.generateAuditModel(sequelize, model);
    db[auditModel.name] = auditModel;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// const auditDir = `${__dirname}/audit/`;
// fs
//   .readdirSync(auditDir)
//   .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
//   .forEach((file) => {
//     const model = sequelize.import(path.join(auditDir, file));
//     db[model.name] = model;
//   });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
