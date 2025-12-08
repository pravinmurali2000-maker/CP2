import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';

// As per the design, the Role enum should be defined.
// Let's create a shared enum for this.
export enum Role {
  Admin = 'admin',
  Manager = 'manager',
  Viewer = 'viewer',
}


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({ nullable: true })
  team_id?: number;

  @OneToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
