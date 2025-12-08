import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';

export enum MatchStatus {
    Scheduled = 'scheduled',
    InProgress = 'in_progress',
    Completed = 'completed',
    Postponed = 'postponed',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tournament_id: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches)
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column()
  home_team_id: number;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'home_team_id' })
  home_team: Team;

  @Column()
  away_team_id: number;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'away_team_id' })
  away_team: Team;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'time', nullable: true })
  time: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ type: 'int', nullable: true })
  home_score: number;

  @Column({ type: 'int', nullable: true })
  away_score: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.Scheduled,
  })
  status: MatchStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
