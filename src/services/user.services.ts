import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { ResponseData } from '../interfaces/response.interfaces';
import { Helper } from '../utils/helper.class';

export class UserService {

  private userRepository: Repository<User>;

  private helper: Helper;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.helper = new Helper();
  }



  /**
   * Change user password
   * @param {User} user 
   * @param {string} newPassword 
   * @param {string} oldPassword 
   * @returns 
   */
  public resetPassword = async (user: User, newPassword: string, oldPassword: string): Promise<ResponseData> => {
    const queryRunner = AppDataSource.createQueryRunner();
    let responseData: ResponseData;
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
        } else {
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
      } else {
        responseData = {
          status: 404,
          message: 'User Not Found',
          data: null,
        };
      }

      await queryRunner.commitTransaction();
      
      return responseData;

    } catch (err) {
      console.log(err);
      responseData = {
        status: 500,
        message: 'Internal Server Error',
        data: null,
      };
      await queryRunner.rollbackTransaction();
      return responseData;
    } finally {
      await queryRunner.release();
    }
  };

  /**
   * Update User Data
   * @param {number} id
   * @param {User} user
   * @return {Promise<ResponseData>}
   */
  public updateUserData = async (id: number, user: User): Promise<ResponseData> => {
    let responseData: ResponseData;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      let userData = await this.userRepository.createQueryBuilder()
        .update({
          fullname: user.fullname,
        })
        .where({ id: id })
        .returning('*')
        .execute();
        
      let response = userData.raw[0] as User;
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return responseData = {
        status: 500,
        message: 'Internal Server Error',
        data: null,
      };
    } finally {
      await queryRunner.release();
    }
  };

}