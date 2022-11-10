"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const helper_class_1 = require("../utils/helper.class");
class UserService {
    userRepository;
    helper;
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.helper = new helper_class_1.Helper();
    }
    resetPassword = async (user, newPassword, oldPassword) => {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        let responseData;
        await queryRunner.startTransaction();
        try {
            const userData = await this.userRepository.findOneBy({
                id: user.id,
            });
            // GET USER DATA
            if (userData) {
                // CHECK IF OLD PASSWORD IS EQUAL WITH BCRYPT HELPER
                if (await this.helper.isOldPasswordValid(userData.password, oldPassword)) {
                    const encryptedPassword = this.helper.hashPassword(newPassword);
                    await this.userRepository.update(userData.id, {
                        password: encryptedPassword,
                    });
                    responseData = {
                        status: 200,
                        message: 'User Password Changed Successfully',
                        data: null,
                    };
                }
                else {
                    responseData = {
                        status: 400,
                        message: [
                            {
                                msg: 'Old Password Is Wrong',
                            },
                        ],
                        data: null,
                    };
                }
            }
            else {
                responseData = {
                    status: 404,
                    message: 'User Not Found',
                    data: null,
                };
            }
            return responseData;
        }
        catch (err) {
            console.log(err);
            responseData = {
                status: 500,
                message: 'Internal Server Error',
                data: null,
            };
            await queryRunner.rollbackTransaction();
            return responseData;
        }
        finally {
            await queryRunner.release();
        }
    };
    updateUserData = async (id, user) => {
        let responseData;
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            let userData = await this.userRepository.createQueryBuilder()
                .update({
                fullname: user.fullname,
            })
                .where({ id: id })
                .returning('*')
                .execute();
            let response = userData.raw[0];
            responseData = {
                status: 200,
                message: 'Data updated successfully',
                data: {
                    id: response.id,
                    fullname: response.fullname,
                    isEmailVerified: response.isEmailVerified,
                    email: response.email,
                    registerType: response.registerType,
                },
            };
            await queryRunner.commitTransaction();
            return responseData;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            return responseData = {
                status: 500,
                message: 'Internal Server Error',
                data: null,
            };
        }
        finally {
            await queryRunner.release();
        }
    };
}
exports.UserService = UserService;
//# sourceMappingURL=user.services.js.map