"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MSQL_DB_NAME = process.env.MSQL_DB_NAME;
const MSQL_DB_USER = process.env.MSQL_DB_USER;
const MSQL_DB_PASSWORD = process.env.MSQL_DB_PASSWORD;
const MSQL_DB_HOST = process.env.MSQL_DB_HOST;
const MSQL_DB_PORT = process.env.MSQL_DB_PORT ? parseInt(process.env.MSQL_DB_PORT) : 1433;
const sequelize = new sequelize_1.Sequelize(MSQL_DB_NAME, MSQL_DB_USER, MSQL_DB_PASSWORD, {
    host: MSQL_DB_HOST,
    dialect: "mssql",
    logging: false,
    port: MSQL_DB_PORT,
});
exports.default = sequelize;
