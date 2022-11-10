"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const app_1 = require("./app");
const data_source_1 = require("./data-source");
data_source_1.AppDataSource.initialize().then(async () => {
    const server = new app_1.App();
    server.start();
}).catch(error => console.log(error));
//# sourceMappingURL=index.js.map