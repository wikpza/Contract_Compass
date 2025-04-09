import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const MSQL_DB_NAME = process.env.MSQL_DB_NAME as string;
const MSQL_DB_USER = process.env.MSQL_DB_USER as string;
const MSQL_DB_PASSWORD = process.env.MSQL_DB_PASSWORD as string;
const MSQL_DB_HOST = process.env.MSQL_DB_HOST as string;
const MSQL_DB_PORT = process.env.MSQL_DB_PORT ? parseInt(process.env.MSQL_DB_PORT) : 1433;

const sequelize = new Sequelize(MSQL_DB_NAME, MSQL_DB_USER, MSQL_DB_PASSWORD, {
    host: MSQL_DB_HOST,
    dialect: "mssql",
    logging: false,
    port: MSQL_DB_PORT,
});

export default sequelize;
