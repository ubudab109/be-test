"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_services_1 = require("../services/auth.services");
const jwt_config_1 = __importDefault(require("../config/jwt.config"));
const register_type_enum_1 = require("../utils/register_type.enum");
class AuthController {
    //ROUTER INSTANCE
    router;
    // AUTHSERVICE INSTANCE
    services;
    constructor() {
        this.router = (0, express_1.Router)();
        this.services = new auth_services_1.AuthService();
    }
    login = async (req, res) => {
        const request = req.body;
        if (request.type === register_type_enum_1.RegisterType.GOOGLE) {
            let login = await this.services.loginOrRegisterGoogle(request.token);
            res.status(login.status).json(login);
        }
        else if (request.type === register_type_enum_1.RegisterType.FACEBOOK) {
            let login = await this.services.loginOrRegisterFacebok(request);
            res.status(login.status).json(login);
        }
        else {
            let login = await this.services.login(request.email, request.password);
            res.status(login.status).json(login);
        }
    };
    register = async (req, res) => {
        const request = req.body;
        if (request.type === register_type_enum_1.RegisterType.GOOGLE) {
            let register = await this.services.loginOrRegisterGoogle(request.token);
            res.status(register.status).json(register);
        }
        else if (request.type === register_type_enum_1.RegisterType.FACEBOOK) {
            let register = await this.services.loginOrRegisterFacebok(request);
            res.status(register.status).json(register);
        }
        else {
            let register = await this.services.register(request);
            res.status(register.status).json(register);
        }
    };
    resendVerification = async (req, res) => {
        const request = req.body;
        const email = request.email;
        let isEmailSend = await this.services.sendEmailToUser(email, 'email');
        let response;
        if (isEmailSend) {
            response = {
                status: 200,
                message: 'Verification sended',
                data: true,
            };
        }
        else {
            response = {
                status: 400,
                message: 'Sending verification error',
                data: false,
            };
        }
        res.status(response.status).json(response);
    };
    confirmVerification = async (req, res) => {
        const token = req.query.token;
        let isVerified = await this.services.verifyTokenUser(token);
        res.status(isVerified.status).json(isVerified);
    };
    logout = async (req, res) => {
        let user = res.locals.jwtPayload.userId;
        let updated = await this.services.updateSessionData(user);
        res.status(updated.status).json(updated);
    };
    validateToken = async (req, res) => {
        const token = req.headers.authorization;
        let jwtPayload;
        let responseData;
        try {
            jwtPayload = jsonwebtoken_1.default.verify(token, jwt_config_1.default.jwtSecret);
            res.locals.jwtPayload = jwtPayload;
            responseData = {
                status: 200,
                message: 'Authorized',
            };
        }
        catch (err) {
            // IF TOKEN IS INVALID
            responseData = {
                status: 401,
                message: 'Unauthorized',
            };
        }
        res.status(responseData.status).send(responseData);
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map