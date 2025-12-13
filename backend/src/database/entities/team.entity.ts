import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { Player } from './player.entity';
import { User } from './user.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tournament_id: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.teams)
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column()
  name: string;

  @Column({ nullable: true })
  manager_id: number;

  @ManyToOne(() => User, (user) => user.teams)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  played: number;

  @Column({ type: 'int', default: 0 })
  won: number;

  @Column({ type: 'int', default: 0 })
  drawn: number;

  @Column({ type: 'int', default: 0 })
  lost: number;

  @Column({ type: 'int', default: 0 })
  goalsFor: number;

  @Column({ type: 'int', default: 0 })
  goalsAgainst: number;

  @Column({ type: 'int', default: 0 })
  goalDifference: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
