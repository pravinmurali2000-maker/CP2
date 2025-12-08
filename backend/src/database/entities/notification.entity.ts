import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';

export enum NotificationPriority {
    Normal = 'normal',
    Urgent = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tournament_id: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.notifications)
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.Normal,
  })
  priority: NotificationPriority;

  @CreateDateColumn()
  timestamp: Date;
}
