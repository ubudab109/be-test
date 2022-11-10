import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('increment')
    id: number;
  
  @Column({
    type: 'timestamptz',
    precision: 3,
    nullable: true,
  })
    lastSeen: Date;

  @ManyToOne(() => User, (user : User) => user.session, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
    user: User;
}