import {
  Request,
  Response,
  Router,
} from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import { VerificationType } from '../utils/verification_type.enum';
import { AuthService } from '../services/auth.services';
import { UserVerification } from '../entity/UserVerification';
import { ResponseData } from '../interfaces/response.interfaces';
import jwtConfig from '../config/jwt.config';
import { RegisterType } from '../utils/register_type.enum';

export class AuthController {
  //ROUTER INSTANCE
  public router: Router;

  // AUTHSERVICE INSTANCE
  private services: AuthService;

  constructor() {
    this.router = Router();
    this.services = new AuthService();
  }

  public login = async (req: Request, res: Response) => {
    const request = req.body;
    if (request.type === RegisterType.GOOGLE) {
      let login = await this.services.loginOrRegisterGoogle(request.token);
      res.status(login.status).json(login);
    } else if (request.type === RegisterType.FACEBOOK) {
      let login = await this.services.loginOrRegisterFacebok(request);
      res.status(login.status).json(login);
    } else {
      let login = await this.services.login(request.email, request.password);
      res.status(login.status).json(login);
    }

  };

  public register = async (req: Request, res: Response) => {
    const request = req.body;
    if (request.type === RegisterType.GOOGLE) {
      let register = await this.services.loginOrRegisterGoogle(request.token);
      res.status(register.status).json(register);
    } else if (request.type === RegisterType.FACEBOOK) {
      let register = await this.services.loginOrRegisterFacebok(request);
      res.status(register.status).json(register);
    } else {
      let register = await this.services.register(request);
      res.status(register.status).json(register);
    }
  };

  public resendVerification = async (req: Request, res: Response) => {
    const request = req.body;
    const email = request.email as User;
    let isEmailSend = await this.services.sendEmailToUser(email, 'email' as VerificationType);
    let response: ResponseData;
    if (isEmailSend) {
      response = {
        status: 200,
        message: 'Verification sended',
        data: true,
      };
    } else {
      response = {
        status: 400,
        message: 'Sending verification error',
        data: false,
      };
    }
    res.status(response.status).json(response);

  };

  public confirmVerification = async (req: Request, res: Response) => {
    const token = req.query.token as unknown as UserVerification;
    let isVerified = await this.services.verifyTokenUser(token);
    res.status(isVerified.status).json(isVerified);
  };

  public logout = async (req: Request, res: Response) => {
    let user = res.locals.jwtPayload.userId as User;
    let updated = await this.services.updateSessionData(user);
    res.status(updated.status).json(updated);
  };

  public validateToken = async (req: Request, res: Response) => {
    const token = <string>req.headers.authorization;
    let jwtPayload;
    let responseData : ResponseData;
    try {
      jwtPayload = <any>jwt.verify(token, jwtConfig.jwtSecret);
      res.locals.jwtPayload = jwtPayload;
      responseData = {
        status: 200,
        message: 'Authorized',
      };
    } catch (err) {
      // IF TOKEN IS INVALID
      responseData = {
        status: 401,
        message: 'Unauthorized',
      };
    }
    res.status(responseData.status).send(responseData);
  };
}