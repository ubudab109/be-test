import { 
  NextFunction, 
  Request, Response, 
} from 'express';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';
import { ResponseData } from '../interfaces/response.interfaces';

export class JWTMiddleware {

  /**
   * THIS FUNCTION IS TO CHECKING THE TOKEN FOR THE AUTHENTICATED REQUEST
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns 
   */
  public checkJwt = (req: Request, res: Response, next: NextFunction) => {
    // GET JWT TOKEN FROM HEADER
    const token = <string>req.headers.authorization;
    let jwtPayload;

    // VALIDATE TOKEN
    try {
      jwtPayload = <any>jwt.verify(token, jwtConfig.jwtSecret);
      res.locals.jwtPayload = jwtPayload;
    } catch (err) {
      // IF TOKEN IS INVALID
      let responseData : ResponseData = {
        status: 401,
        message: 'Unauthorized',
      };
      res.status(401).send(responseData);
      return;
    }
    /**
     * TOKEN VALID FOR 1 HOUR
     * WE WANT SEND A NEW TOKEN ON EVERY REQUEST
     */
    const { userId, email } = jwtPayload;
    const newToken = jwt.sign({ userId, email }, jwtConfig.jwtSecret, {
      expiresIn: '24h',
    });
    res.setHeader('token', newToken);

    // CALL NEXT FUNCTION
    next();
  };
}