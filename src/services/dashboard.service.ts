import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { UserSession } from '../entity/UserSession';
import { ResponseData } from '../interfaces/response.interfaces';
import { Helper } from '../utils/helper.class';

export class DashboardServices {
  private userRepository: Repository<User>;

  private sessionRepository: Repository<UserSession>;

  private helper: Helper;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.sessionRepository = AppDataSource.getRepository(UserSession);
    this.helper = new Helper();
  }


  /**
   * Data dashboard
   * include total user sign up
   * total user active today
   * Average number of active session users in the last 7 days rolling.
   * And List user
   * 
   * @returns {Promise<ResponseData>}
   */
  public dashboard = async () : Promise<ResponseData> => {
    let listUsers = await this.userRepository.find({
      relations: {
        session: true,
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        registerType: true,
        isEmailVerified: true,
        timesLoggedIn: true,
        session: true,
        created_at: true,
      },
    });

    let totalUsers = await this.userRepository.count();
    let activeSessionToday = await this.countTotalActiveUserByDate(
      this.helper.formatDate(new Date()),
      this.helper.formatDate(this.helper.addDays(1)),
    );
    let averageSessionByWeek = await this.averageActiveSessionByWeekRolling();
    
    let responseData: ResponseData = {
      status: 200,
      message: 'List User Fetched Successfully',
      data: {
        totalUsers,
        activeSessionToday: activeSessionToday,
        averageSessionByWeek,
        listUsers,
      },
    };

    return responseData;
  };

  /**
   * This function is used to count the total active user by date.
   * @param {string} startDate
   * @param {string} endDate 
   * @returns {Promise<number>}
   */
  private countTotalActiveUserByDate = async (startDate: string, endDate: string): Promise<number> => {
    let totalActiveSession = await this.sessionRepository
      .createQueryBuilder('user_session')
      .where(`DATE(user_session.lastSeen) BETWEEN '${startDate}' AND '${endDate}'`)
      .getCount();

    return totalActiveSession;
  };

  /**
   * This function is used to calculate the average of active session by week rolling.
   * @returns {Promise<number>}
   */
  private averageActiveSessionByWeekRolling = async (): Promise<string> => {
    let totalActive = [];
    let now = new Date();
    for (var d = this.helper.substractDays(7); d <= now; d.setDate(d.getDate()) + 1) {
      let totalActivePerDay = await this.countTotalActiveUserByDate(
        this.helper.formatDate(d),
        this.helper.formatDate(this.helper.addDaysFromDate(d, 1)),
      );

      totalActive.push(totalActivePerDay);
    }
    let average = totalActive.reduce((a, b) => a + b, 0) / totalActive.length;

    return average.toFixed(0);
  };
}