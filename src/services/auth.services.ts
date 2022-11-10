import { MoreThan, Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { ResponseData } from '../interfaces/response.interfaces';
import { User } from '../entity/User';
import jwtConfig from '../config/jwt.config';
import { RegisterType } from '../utils/register_type.enum';
import { Helper } from '../utils/helper.class';
import { EmailVerification } from '../mail/email.verification';
import { UserVerification } from '../entity/UserVerification';
import { VerificationType } from '../utils/verification_type.enum';
import { UserSession } from '../entity/UserSession';
import GoogleClient from '../config/google.config';

export class AuthService {

  private userRepository: Repository<User>;

  private verificationRepository: Repository<UserVerification>;

  private sessionRepository: Repository<UserSession>;

  private emailVerification: EmailVerification;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.emailVerification = new EmailVerification();
    this.sessionRepository = AppDataSource.getRepository(UserSession);
    this.verificationRepository = AppDataSource.getRepository(UserVerification);
  }

  /**
   * Get user data by email
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  private getUserByEmail = async (email: string): Promise<User | null> => {
    // GET USER DATA BASED ON EMAIL
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  };

  /**
   * THIS FUNCTION IS USED TO SEND VERIFICATION TO USER EMAIL
   * THE VERIFICATION INCLUDE EMAIL VERIFICATION OR FORGOT PASSWORD
   * 
   * @param {User} user 
   * @param {VerificationType} type 
   */
  public sendEmailToUser = async (user: User, type: VerificationType): Promise<boolean> => {
    const helper: Helper = new Helper();
    const userData = await this.getUserByEmail(user.email);
    const token = helper.generateVerificationEmailToken();
    if (userData) {
      // QUERY FOR CHECKING VERIFICATION DATA
      await this.verificationRepository
        .createQueryBuilder()
        .delete()
        .from(UserVerification)
        .where('userId = :userId', { userId: userData.id })
        .andWhere('verificationType = :type', { type: type }).execute();

      // SAVE USER VERIFICATION DATA
      const createVerification = await this.verificationRepository.save({
        user: userData,
        expirationToken: helper.addDays(1),
        token: token,
        verificationType: type,
      });

      // SENDING EMAIL VERIFICATION
      await this.emailVerification.sendConfirmationEmail(userData.email, createVerification.token);

      return true;
    }

    return false;


  };

   
  /**
   * The above code is a function that will be called when a user is trying to login 
   * or register using Facebook.
   * @param {User} user 
   * @returns {Promise<ResponseData>}
   */
  public loginOrRegisterFacebok = async (user: User): Promise<ResponseData> => {
    let responseData: ResponseData;
    let response = {};

    // CHECK USER FIRST
    const existingUser = await this.userRepository.findOneBy({
      email: user.email,
    });

    // CHECK IF USER IS EXISTS BY EMAIL PAYLOAD
    if (existingUser) {
      /**
         * CHECK IF THE USER PREVIOUSLY REGISTERING USING EMAIL
         * IF YES, THEN WE WILL RETURN UNAUTHORIZED RESPONSE
         * THE POINT FOR THIS LOGIC IS TO AVOID ACCOUNT ABUSE BY USING A FACEBOOK ACCOUNT 
         * INSTEAD OF USING A PRE-REGISTERED EMAIL PASSWORD 
      */
      if (existingUser.registerType === RegisterType.EMAIL) {
        return responseData = {
          status: 401,
          message: 'This Email has been registered using Email. Please login using Your Credential',
          data: null,
        };
      }

      // IF USER EXISTS THEN INCREMENT THE TIMES LOGGED IN
      await this.userRepository.increment({
        id: existingUser.id,
      }, 'timesLoggedIn', 1);

      // SAVE CURRENT SESSION
      await this.saveSessionData(existingUser);

      //SIGN JWT, VALID FOR 24 HOUR
      const jwtToken = this.signJwt(existingUser);

      // THE USER DATA
      response = {
        id: existingUser.id,
        fullname: existingUser.fullname,
        isEmailVerified: existingUser.isEmailVerified,
        email: existingUser.email,
        registerType: existingUser.registerType,
        token: jwtToken,
      };
    } else {

      user.isEmailVerified = true;
      user.registerType = RegisterType.FACEBOOK;

      // SAVING THE NEW ACCOUNT TO OUR END
      const dataUser = await this.userRepository.save(user);

      // SIGN JWT, VALID FOR 24 HOUR
      const jwtToken = this.signJwt(user);

      // THE USER DATA
      response = {
        id: dataUser.id,
        fullname: dataUser.fullname,
        isEmailVerified: dataUser.isEmailVerified,
        email: dataUser.email,
        registerType: dataUser.registerType,
        token: jwtToken,
      };

    }
    responseData = {
      status: 200,
      message: 'Login Successfully',
      data: response,
    };
    return responseData;
    

  };

  /**
   * Login Or Register with Google
   * @param {String} token 
   * @returns {Promise<ResponseData>}
   */
  public loginOrRegisterGoogle = async (token: string): Promise<ResponseData> => {

    // VERIFY THE TOKEN FROM CLIENT
    const ticket = await GoogleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });


    const user: User = new User();

    const payload = ticket.getPayload();

    let responseData: ResponseData;

    /**
     * WE NEED TO CHECK IF PAYLOAD IS EXISTS
     * IF PAYLOAD IS RETURNING, THEN WE WILL PROCESS
     * THE LOGIN AUTH GOOGLE
     */
    if (payload) {

      // RESPONSE DATA
      let response = {};

      // CHECK USER FIRST
      const existingUser = await this.userRepository.findOneBy({
        email: payload.email,
      });

      // CHECK IF USER IS EXISTS BY EMAIL PAYLOAD
      if (existingUser) {

        /**
         * CHECK IF THE USER PREVIOUSLY REGISTERING USING EMAIL
         * IF YES, THEN WE WILL RETURN UNAUTHORIZED RESPONSE
         * THE POINT FOR THIS LOGIC IS TO AVOID ACCOUNT ABUSE BY USING A GOOGLE ACCOUNT 
         * INSTEAD OF USING A PRE-REGISTERED EMAIL PASSWORD 
         */
        if (existingUser.registerType === RegisterType.EMAIL) {
          return responseData = {
            status: 401,
            message: 'This Email has been registered using Email. Please login using Your Credential',
            data: null,
          };
        }

        //IF USER EXISTS THEN INCREMENT THE TIMES LOGGED IN
        await this.userRepository.increment({
          id: existingUser.id,
        }, 'timesLoggedIn', 1);

        // SAVE CURRENT SESSION
        await this.saveSessionData(existingUser);

        // SIGN JWT, VALID FOR 24 HOUR
        const jwtToken = this.signJwt(existingUser);

        // THE USER DATA
        response = {
          id: existingUser.id,
          fullname: existingUser.fullname,
          isEmailVerified: existingUser.isEmailVerified,
          email: existingUser.email,
          registerType: existingUser.registerType,
          token: jwtToken,
        };
      } else {

        // SAVING THE NEW ACCOUNT TO OUR END
        user.fullname = payload.name!;
        user.email = payload.email!;
        user.isEmailVerified = true;
        user.registerType = RegisterType.GOOGLE;
        const dataUser = await this.userRepository.save(user);

        // SIGN JWT, VALID FOR 24 HOUR
        const jwtToken = this.signJwt(user);

        // THE USER DATA
        response = {
          id: dataUser.id,
          fullname: dataUser.fullname,
          isEmailVerified: dataUser.isEmailVerified,
          email: dataUser.email,
          registerType: dataUser.registerType,
          token: jwtToken,
        };
      }

      responseData = {
        status: 200,
        message: 'Logged in Successfully',
        data: response,
      };

    } else {
      responseData = {
        status: 500,
        message: 'Internal Server Error',
        data: null,
      };
    }

    return responseData;
  };

  /**
   * SERVICES FUNCTION TO LOGIN
   * @param {String} email 
   * @param {String} password 
   * @returns {Promise<ResponseData>}
   */
  public login = async (email: string, password: string): Promise<ResponseData> => {
    let responseData: ResponseData;

    // GET USER DATA BASED ON EMAIL
    const user = await this.getUserByEmail(email);

    /**
     * CHECK IF USER DOESN'T EXISTS, THEN RETURN 401 WITH MESSAGE
     * CREDENTIAL NOT FOUND
    */
    if (!user) {
      responseData = {
        status: 401,
        message: 'Credential Not Found',
        data: null,
      };
    } else {
      // CHECK IF ENCRYPTES PASSWORD MATCH
      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        responseData = {
          status: 401,
          message: 'Wrong Password',
          data: null,
        };
      } else {
        // CHECK IF USER WAS VERIFIED
        if (!user.isEmailVerified) {
          responseData = {
            status: 401,
            message: 'Email Not Verified',
            data: {
              id: user.id,
              fullname: user.fullname,
              isEmailVerified: false,
              email: user.email,
              registerType: user.registerType,
              token: null,
            },
          };
        } else {
          // SIGN JWT, VALID FOR 24 HOUR
          const token = this.signJwt(user);

          // SAVE CURRENT SESSION
          await this.saveSessionData(user);

          // ADD TIMES LOGGED IN
          await this.userRepository.increment({
            id: user.id,
          }, 'timesLoggedIn', 1);

          responseData = {
            status: 200,
            message: 'Successfully Logged In',
            data: {
              id: user.id,
              fullname: user.fullname,
              isEmailVerified: true,
              registerType: user.registerType,
              email: user.email,
              token: token,
            },
          };
        }
      }
    }

    return responseData;
  };

  /**
   * SERVICES FUNCTION TO REGISTER AND SEND VERIFICATION EMAIL
   * IF USER REGISTERED USING EMAIL THEN USER SHOULD VERIFYING THEIR ACCOUNT
   * IF USER REGISTERED USING GOOGLE OR FACEBOOK, THEIR ACCOUNTS
   * AUTOMATICALLY VERIFIED
   * 
   * @param {User} data 
   * @returns {Promise<ResponseData>}
   */
  public register = async (data: User): Promise<ResponseData> => {
    let responseData: ResponseData;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // CALL HELPER CLASS
      const helper: Helper = new Helper();

      data.registerType = RegisterType.EMAIL;

      // HASHING A PASSWORD
      data.password = helper.hashPassword(data.password);

      // SAVE USER DATA
      const create = await this.userRepository.save(data);

      // SEND EMAIL VERIFICATION
      await this.sendEmailToUser(create, VerificationType.EMAIL);

      await queryRunner.commitTransaction();


      responseData = {
        status: 200,
        message: 'Registered Successfully. Kindly check Your inbox or spam email to confirm the registration.',
        data: {
          id: create.id,
          fullname: create.fullname,
          email: create.email,
          registerType: data.registerType,
          created_at: data.created_at,
          isEmailVerified: create.isEmailVerified,
        },
      };
      return responseData;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      responseData = {
        status: 500,
        message: err,
        data: null,
      };
      return responseData;
    } finally {
      await queryRunner.release();
    }
  };

  /**
   * A function that is used to verify the token by user id, token, and verification type (EMAIL, FORGOT PASSWORD)
   * 
   * @param {User} user 
   * @param {UserVerification} verification 
   * @returns {Promise<ResponseData>}
   */
  public verifyTokenUser = async (verification: UserVerification): Promise<ResponseData> => {
    let responseData: ResponseData;

    // CHECK IF PARAMS IS NULL
    if (!verification) {
      responseData = {
        status: 400,
        message: 'Token is required',
        data: null,
      };
    } else {

      // GET THE VERIFICATION DATA
      const verificationData = await this.verificationRepository.findOne({
        where: {
          token: verification.token,
          isUsed: false,
          expirationToken: MoreThan(new Date()),
        },
        relations: ['user'],
      });

      // IF VERIFICATION NOT FOUND THEN RETURN 404
      if (!verificationData) {
        responseData = {
          status: 404,
          message: 'Verification Not Found or Expired',
          data: null,
        };
      } else {
        // GET USER DATA
        const userData = await this.getUserByEmail(verificationData.user.email);

        // CHECK IF USER DATA EXISTS
        if (userData) {
          /**
           * CHECK IF VERICIATION TYPE IS EMAIL
           * THEN UPDATE USER DATA 'IS VERIFIED' TO TRUE
           */
          if (verificationData.verificationType === VerificationType.EMAIL) {
            await this.userRepository.update(userData.id, { isEmailVerified: true });
          }
        }

        // UPDATE VERIFICATION DATA 'IS USED' TO TRUE
        await this.verificationRepository.createQueryBuilder()
          .update({
            isUsed: true,
          })
          .where({ id: verificationData.id })
          .returning('*')
          .execute();

        const user = verificationData.user;
        // SIGN JWT, VALID FOR 1 HOUR
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          jwtConfig.jwtSecret,
          { expiresIn: '1h' },
        );

        // SAVE CURRENT SESSION
        await this.saveSessionData(user);

        // ADD TIMES LOGGED IN
        await this.userRepository.increment({
          id: user.id,
        }, 'timesLoggedIn', 1);

        responseData = {
          status: 200,
          message: 'Verification Found',
          data: {
            id: user.id,
            fullname: user.fullname,
            isEmailVerified: true,
            email: user.email,
            token: token,
          },
        };
      }

    }

    return responseData;
  };
  
  /**
   * UPDATE SESSION DATA 
   * THIS FUNCTION MAY BE WILL USED IN EVERY LOGOUT REQUEST
   * @param {User} user 
   */
  public updateSessionData = async (user: User) => {
    let sessionData = await this.sessionRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        user: {
          id: user.id,
        },
      },
      order: { lastSeen: 'DESC' },
    });

    if (sessionData) {
      await this.sessionRepository.update(sessionData.id, { lastSeen: new Date() });
    }

    let responseData: ResponseData = {
      status: 200,
      message: 'User logout successfully',
      data: null,
    };

    return responseData;
  };

  /**
   * The above code is signing a JWT.
   * @param {User} user 
   * @returns {String}
   */
  private signJwt = (user: User): String => {
    // SIGN JWT, VALID FOR 1 HOUR
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtConfig.jwtSecret,
      { expiresIn: '24h' },
    );
    return token;
  };

  /**
   * SAVING SESSION DATA
   * 
   * @param {User} user 
   */
  private saveSessionData = async (user: User) => {
    await this.sessionRepository.save({
      lastSeen: new Date(),
      user: user,
    });
  };
}