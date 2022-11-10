"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    services;
    constructor() {
        this.services = new dashboard_service_1.DashboardServices();
    }
    index = async (req, res) => {
        let data = await this.services.dashboard();
        res.status(data.status).json(data);
    };
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map