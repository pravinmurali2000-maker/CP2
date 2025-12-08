import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Team } from './team.entity';
import { Match } from './match.entity';
import { Notification } from './notification.entity';

export enum TournamentStatus {
  Draft = 'draft',
  Live = 'live',
  Completed = 'completed',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  format: string;

  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.Draft,
  })
  status: TournamentStatus;

  @OneToMany(() => Team, (team) => team.tournament)
  teams: Team[];

  @OneToMany(() => Match, (match) => match.tournament)
  matches: Match[];

  @OneToMany(() => Notification, (notification) => notification.tournament)
  notifications: Notification[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
