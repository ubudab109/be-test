import { Request, Response } from 'express';
import { User } from '../entity/User';
import { UserService } from '../services/user.services';

export class UserController {


  private services: UserService;

  constructor() {
    this.services = new UserService();
  }


  public changePassword = async (req: Request, res: Response) => {
    let user = res.locals.jwtPayload.userId as User;
    let data = await this.services.resetPassword(user, req.body.newPassword, req.body.oldPassword);
    res.status(data.status).json(data);
  };

  public updateProfile = async (req: Request, res: Response) => {
    let user = req.body as User;
    let userId = res.locals.jwtPayload.userId;
    let data = await this.services.updateUserData(userId, user);
    res.status(data.status).json(data);
  };
}