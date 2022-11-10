import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserSession } from './UserSession';
import { RegisterType } from '../utils/register_type.enum';
import { UserVerification } from './UserVerification';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
    id: number;

  @OneToMany(() => UserSession, (session : UserSession) => session.user)
    session: UserSession[];
  
  @OneToOne(() => UserVerification, (verification : UserVerification) => verification.user)
    verification: UserVerification;

  @Column({ unique: true })
    email: string;

  @Column()
    fullname: string;

  @Column({
    nullable: true,
  })
    password: string;

  @Column({
    type: 'enum',
    enum: RegisterType,
    default: null,
  })
    registerType: RegisterType;

  @Column({
    type: 'boolean',
    default: 0,
  })
    isEmailVerified: boolean;
  
  @Column({
    type: 'int',
    default: 0,
  })
    timesLoggedIn: number;

  @CreateDateColumn()
    created_at: Date;

  checkIfUnencryptedPasswordIsValid(unecrypted: string) : boolean {
    return bcrypt.compareSync(unecrypted, this.password);
  }

}
