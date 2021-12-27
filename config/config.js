require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: (process.env.POSTGRES_HOST || 'localhost'),
    port: (process.env.POSTGRES_PORT || 5432),
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
  },
  test: {
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: (process.env.POSTGRES_HOST || 'localhost'),
    port: (process.env.POSTGRES_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: (process.env.POSTGRES_PORT || 5432),
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
  },
};
