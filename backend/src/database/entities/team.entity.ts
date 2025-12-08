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
  manager_name: string;

  @Column({ nullable: true })
  manager_email: string;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
