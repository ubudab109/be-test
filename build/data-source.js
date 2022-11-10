"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [__dirname + '/entity/*.js'],
    migrations: ['src/subscriber/**/*.ts'],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'DEV' ? false : {
        rejectUnauthorized: false,
    },
});
//# sourceMappingURL=data-source.js.map