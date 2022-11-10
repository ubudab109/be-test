import express, {
  Request,
  Response,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { ApiRoutes } from './routes/api.routes';
import { validationResult } from 'express-validator';
import { ResponseData } from './interfaces/response.interfaces';

export class App {

  private app: express.Application;

  constructor() {
    this.app = express();
    this.configuration();
    this.routes();
  }

  /**
   * THIS FUNCTION IS TO CONFIGURE THE PORT IN APP
   * IF PORT NOT SET IN .env THEN THIS APP WILL USE DEFAULT PORT 3030
   */
  public configuration = () => {
    this.app.set('port', process.env.PORT);
  };

  /**
   * THIS FUNCTION IS TO CONFIGURE THE ROUTES
   */
  public routes = async () => {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Backend Test');
    });
    ApiRoutes.forEach(route => {
      (this.app as any)[route.method](route.route, !route.middleware ? [] : route.middleware,
        ...route.validation,
        async (req: Request, res: Response, next: Function): Promise<void> => {
          try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              let responseData : ResponseData = {
                status: 400,
                message: errors.array(),
                data: null,
              };
              res.status(422).json(responseData);
            } else {
              await (new (route.controller as any))[route.action](req, res, next);
            }
          } catch (err) {
            next(err);
          }
        });
    });
  };

  /**
   * FUNCTION TO START APPLICATION
   */
  public start = () => {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening ${this.app.get('port')} port`);
    });
  };
}