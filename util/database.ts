import { Sequelize } from "sequelize";

const databaseConfig = {
  dialect: "mysql" as const,
  host: "localhost",
  username: "root",
  password: "riverdale",
  database: "bitespeed-task",
};

const sequelize = new Sequelize(databaseConfig);

export default sequelize;
