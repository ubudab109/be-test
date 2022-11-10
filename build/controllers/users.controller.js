"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_services_1 = require("../services/user.services");
class UserController {
    services;
    constructor() {
        this.services = new user_services_1.UserService();
    }
    changePassword = async (req, res) => {
        let user = res.locals.jwtPayload.userId;
        let data = await this.services.resetPassword(user, req.body.newPassword, req.body.oldPassword);
        res.status(data.status).json(data);
    };
    updateProfile = async (req, res) => {
        let user = req.body;
        let userId = res.locals.jwtPayload.userId;
        let data = await this.services.updateUserData(userId, user);
        res.status(data.status).json(data);
    };
}
exports.UserController = UserController;
//# sourceMappingURL=users.controller.js.map