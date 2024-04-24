import { Sequelize } from "sequelize";

const databaseConfig = {
  dialect: "mysql" as const,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const sequelize = new Sequelize(databaseConfig);

export default sequelize;
