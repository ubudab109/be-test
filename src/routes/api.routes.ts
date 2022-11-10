import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { AuthController } from '../controllers/auth.controller';
import { body } from 'express-validator/src/middlewares/validation-chain-builders';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { UserController } from '../controllers/users.controller';
import { Helper } from '../utils/helper.class';
import { DashboardController } from '../controllers/dashboard.controller';

const jwt: JWTMiddleware = new JWTMiddleware();

export const ApiRoutes = [
  {
    method: 'post',
    route: '/api/login',
    controller: AuthController,
    action: 'login',
    middleware: null,
    validation: [
      body('type')
        .isIn(['email', 'google', 'facebook'])
        .withMessage('Login Type is Invalid')
        .bail(),
      body('token')
        .if(body('type').equals('google'))
        .isString()
        .withMessage('Token is required'),
      body('email')
        .custom((value: string, { req }) => {
          if (req.body.type === 'email' || req.body.type === 'facebook') {
            if (value === '' || !value) {
              throw new Error('Email is Required');
            } else {
              let helper: Helper = new Helper();
              if (helper.validateEmail(value)) {
                return true;
              } else {
                throw new Error('Email Invalid');
              }
            }
          } else {
            return true;
          }
        }),
      body('password')
        .if(body('type').equals('email'))
        .isLength({ min: 8 })
        .withMessage('Password is Required'),
    ],
  },
  {
    method: 'post',
    route: '/api/register',
    controller: AuthController,
    action: 'register',
    middleware: null,
    validation: [
      body('type')
        .isIn(['email', 'google', 'facebook'])
        .withMessage('Register Type is Invalid')
        .bail(),
      body('token')
        .if(body('type').equals('google'))
        .isString()
        .withMessage('Token is required'),
      body('fullname')
        .custom((value: string, { req }) => {
          if (req.body.type === 'email' || req.body.type === 'facebook') {
            if (value === '' || !value) {
              throw new Error('Fullname is Required');
            } else {
              return true;
            }
          } else {
            return true;
          }
        }),
      body('email')
        .custom((value: string, { req }) => {
          if (req.body.type === 'email' || req.body.type === 'facebook') {
            if (value === '' || !value) {
              throw new Error('Email is Required');
            } else {
              let helper: Helper = new Helper();
              if (helper.validateEmail(value)) {
                return true;
              } else {
                throw new Error('Email Invalid');
              }
            }
          } else {
            return true;
          }
        })
        .custom(async (value: string) => {
          if (!value) {
            return false;
          }
          const user = await AppDataSource.getRepository(User).findOneBy({
            email: value,
          });
          if (user) {
            return Promise.reject('Email already taken');
          }
        }),
      body('password')
        .if(body('type').equals('email'))
        .isStrongPassword({
          minLength: 8,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          minUppercase: 1,
        })
        .withMessage('Password should contains at least one lower character, one upper character, one digit character, one special character, with length min 8 characters'),
      body('confirm_password')
        .if(body('type').equals('email'))
        .custom((value: string, { req }) => {
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
    controller: AuthController,
    action: 'resendVerification',
    middleware: null,
    validation: [
      body('email').isEmail().withMessage('Email is Required'),
    ],
  },
  {
    method: 'get',
    route: '/api/confirm-verification',
    controller: AuthController,
    action: 'confirmVerification',
    middleware: null,
    validation: [],
  },
  {
    method: 'post',
    route: '/api/logout',
    controller: AuthController,
    action: 'logout',
    middleware: jwt.checkJwt,
    validation: [],
  },
  {
    method: 'get',
    route: '/api/user',
    controller: UserController,
    action: 'index',
    middleware: jwt.checkJwt,
    validation: [],
  },
  {
    method: 'put',
    route: '/api/change-password',
    controller: UserController,
    action: 'changePassword',
    middleware: jwt.checkJwt,
    validation: [
      body('oldPassword').isString().withMessage('Old Password is Required'),
      body('newPassword').isStrongPassword(),
      body('confirmPassword').isStrongPassword().custom((value: string, { req }) => {
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
    controller: UserController,
    action: 'updateProfile',
    middleware: jwt.checkJwt,
    validation: [
      body('fullname').isString().withMessage('Fullname is Required'),
    ],
  },
  {
    method: 'post',
    route: '/api/validate-token',
    controller: AuthController,
    action: 'validateToken',
    middelware: jwt.checkJwt,
    validation: [],
  },
  {
    method: 'get',
    route: '/api/dashboard',
    controller: DashboardController,
    action: 'index',
    middleware: jwt.checkJwt,
    validation: [],
  },
];