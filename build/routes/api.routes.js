"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRoutes = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_chain_builders_1 = require("express-validator/src/middlewares/validation-chain-builders");
const jwt_middleware_1 = require("../middleware/jwt.middleware");
const users_controller_1 = require("../controllers/users.controller");
const helper_class_1 = require("../utils/helper.class");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const jwt = new jwt_middleware_1.JWTMiddleware();
exports.ApiRoutes = [
    {
        method: 'post',
        route: '/api/login',
        controller: auth_controller_1.AuthController,
        action: 'login',
        middleware: null,
        validation: [
            (0, validation_chain_builders_1.body)('type')
                .isIn(['email', 'google', 'facebook'])
                .withMessage('Login Type is Invalid')
                .bail(),
            (0, validation_chain_builders_1.body)('token')
                .if((0, validation_chain_builders_1.body)('type').equals('google'))
                .isString()
                .withMessage('Token is required'),
            (0, validation_chain_builders_1.body)('email')
                .custom((value, { req }) => {
                if (req.body.type === 'email' || req.body.type === 'facebook') {
                    if (value === '' || !value) {
                        throw new Error('Email is Required');
                    }
                    else {
                        let helper = new helper_class_1.Helper();
                        if (helper.validateEmail(value)) {
                            return true;
                        }
                        else {
                            throw new Error('Email Invalid');
                        }
                    }
                }
                else {
                    return true;
                }
            }),
            (0, validation_chain_builders_1.body)('password')
                .if((0, validation_chain_builders_1.body)('type').equals('email'))
                .isLength({ min: 8 })
                .withMessage('Password is Required'),
        ],
    },
    {
        method: 'post',
        route: '/api/register',
        controller: auth_controller_1.AuthController,
        action: 'register',
        middleware: null,
        validation: [
            (0, validation_chain_builders_1.body)('type')
                .isIn(['email', 'google', 'facebook'])
                .withMessage('Register Type is Invalid')
                .bail(),
            (0, validation_chain_builders_1.body)('token')
                .if((0, validation_chain_builders_1.body)('type').equals('google'))
                .isString()
                .withMessage('Token is required'),
            (0, validation_chain_builders_1.body)('fullname')
                .custom((value, { req }) => {
                if (req.body.type === 'email' || req.body.type === 'facebook') {
                    if (value === '' || !value) {
                        throw new Error('Fullname is Required');
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }),
            (0, validation_chain_builders_1.body)('email')
                .custom((value, { req }) => {
                if (req.body.type === 'email' || req.body.type === 'facebook') {
                    if (value === '' || !value) {
                        throw new Error('Email is Required');
                    }
                    else {
                        let helper = new helper_class_1.Helper();
                        if (helper.validateEmail(value)) {
                            return true;
                        }
                        else {
                            throw new Error('Email Invalid');
                        }
                    }
                }
                else {
                    return true;
                }
            })
                .custom(async (value) => {
                if (!value) {
                    return false;
                }
                const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({
                    email: value,
                });
                if (user) {
                    return Promise.reject('Email already taken');
                }
            }),
            (0, validation_chain_builders_1.body)('password')
                .if((0, validation_chain_builders_1.body)('type').equals('email'))
                .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                minUppercase: 1,
            })
                .withMessage('Password should contains at least one lower character, one upper character, one digit character, one special character, with length min 8 characters'),
            (0, validation_chain_builders_1.body)('confirm_password')
                .if((0, validation_chain_builders_1.body)('type').equals('email'))
                .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match with password');
                }
                return true;
            }),
        ],
    },
    {
        method: 'post',
        route: '/api/resend-verification',
        controller: auth_controller_1.AuthController,
        action: 'resendVerification',
        middleware: null,
        validation: [
            (0, validation_chain_builders_1.body)('email').isEmail().withMessage('Email is Required'),
        ],
    },
    {
        method: 'get',
        route: '/api/confirm-verification',
        controller: auth_controller_1.AuthController,
        action: 'confirmVerification',
        middleware: null,
        validation: [],
    },
    {
        method: 'post',
        route: '/api/logout',
        controller: auth_controller_1.AuthController,
        action: 'logout',
        middleware: jwt.checkJwt,
        validation: [],
    },
    {
        method: 'get',
        route: '/api/user',
        controller: users_controller_1.UserController,
        action: 'index',
        middleware: jwt.checkJwt,
        validation: [],
    },
    {
        method: 'put',
        route: '/api/change-password',
        controller: users_controller_1.UserController,
        action: 'changePassword',
        middleware: jwt.checkJwt,
        validation: [
            (0, validation_chain_builders_1.body)('oldPassword').isString().withMessage('Old Password is Required'),
            (0, validation_chain_builders_1.body)('newPassword').isStrongPassword(),
            (0, validation_chain_builders_1.body)('confirmPassword').isStrongPassword().custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match with password');
                }
                return true;
            }),
        ],
    },
    {
        method: 'put',
        route: '/api/update-profile',
        controller: users_controller_1.UserController,
        action: 'updateProfile',
        middleware: jwt.checkJwt,
        validation: [
            (0, validation_chain_builders_1.body)('fullname').isString().withMessage('Fullname is Required'),
        ],
    },
    {
        method: 'post',
        route: '/api/validate-token',
        controller: auth_controller_1.AuthController,
        action: 'validateToken',
        middelware: jwt.checkJwt,
        validation: [],
    },
    {
        method: 'get',
        route: '/api/dashboard',
        controller: dashboard_controller_1.DashboardController,
        action: 'index',
        middleware: jwt.checkJwt,
        validation: [],
    },
];
//# sourceMappingURL=api.routes.js.map