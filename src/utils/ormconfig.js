const { DataSource } = require("typeorm");
const dotenv = require("dotenv");
const AccessToken = require("../models/entities/access-token.entity.js");

dotenv.config();

const dbType = process.env.DB_TYPE;

const AppDataSource =
    dbType === "mysql"
        ? new DataSource({
              type: "mysql",
              host: process.env.MYSQL_HOST,
              port: Number(process.env.MYSQL_PORT),
              username: process.env.MYSQL_USER,
              password: process.env.MYSQL_PASSWORD,
              database: process.env.MYSQL_DATABASE,
              entities: [AccessToken],
              synchronize: true,
          })
        : new DataSource({
              type: "mongodb",
              host: process.env.MONGO_HOST,
              port: Number(process.env.MONGO_PORT),
              database: process.env.MONGO_DATABASE,
              entities: [AccessToken],
              synchronize: true,
          });

module.exports = { AppDataSource };
