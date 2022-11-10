"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardServices = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const UserSession_1 = require("../entity/UserSession");
const helper_class_1 = require("../utils/helper.class");
class DashboardServices {
    userRepository;
    sessionRepository;
    helper;
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.sessionRepository = data_source_1.AppDataSource.getRepository(UserSession_1.UserSession);
        this.helper = new helper_class_1.Helper();
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
    dashboard = async () => {
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
        let activeSessionToday = await this.countTotalActiveUserByDate(this.helper.formatDate(new Date()), this.helper.formatDate(this.helper.addDays(1)));
        let averageSessionByWeek = await this.averageActiveSessionByWeekRolling();
        let responseData = {
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
    countTotalActiveUserByDate = async (startDate, endDate) => {
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
    averageActiveSessionByWeekRolling = async () => {
        let totalActive = [];
        let now = new Date();
        for (var d = this.helper.substractDays(7); d <= now; d.setDate(d.getDate()) + 1) {
            let totalActivePerDay = await this.countTotalActiveUserByDate(this.helper.formatDate(d), this.helper.formatDate(this.helper.addDaysFromDate(d, 1)));
            totalActive.push(totalActivePerDay);
        }
        let average = totalActive.reduce((a, b) => a + b, 0) / totalActive.length;
        return average.toFixed(0);
    };
}
exports.DashboardServices = DashboardServices;
//# sourceMappingURL=dashboard.service.js.map