import { Transport } from '../config/nodemailer.config';

export class EmailVerification {

  /**
   * A function that sends an email to the user with a link to confirm their email.
   * 
   * @param {string} email 
   * @param {string} verificationToken 
   */
  public sendConfirmationEmail = async (email: string, verificationToken: string) => {
    const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:2000';
    await Transport.sendMail({
      from: process.env.EMAIL_USERNAME || 'support@mail.com',
      to: email,
      subject: 'Please Confirm Your Account',
      html: `
      <div>
        <h1>Email Confirmation</h1>
        <p>Thank you for registering. Please confirm Your email by clicking on the following link. </p>
        <a href=${frontEndUrl}/verification?token=${verificationToken}> Click here </a>
      </div>
      `,
    });
  };

}