import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config();

const {
  DB_HOST,
  DB_DIALECT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD
} = process.env;

export const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
});
