import { Request, Response } from 'express';
import { DashboardServices } from '../services/dashboard.service';

export class DashboardController {

  private services : DashboardServices;

  constructor() {
    this.services = new DashboardServices();
  }

  public index = async (req: Request, res: Response) => {
    let data = await this.services.dashboard();
    res.status(data.status).json(data);
  };
}