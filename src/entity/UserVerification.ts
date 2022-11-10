import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { VerificationType } from '../utils/verification_type.enum';

@Entity('user_verification')
export class UserVerification {
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({
    type: 'text',
    unique: true,
  })
    token: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
    default: null,
  })
    verificationType: VerificationType;
  
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
    expirationToken: Date;
  
  @Column({
    type: 'boolean',
    default: 0,
  })
    isUsed: boolean;
  
  @ManyToOne(() => User, (user : User) => user.verification, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
    user: User;
}