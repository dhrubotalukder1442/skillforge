import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Skill } from './skill.entity';

@Entity()
export class UserSkill {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill!: Skill;

  @Column()
  skillId!: number;

  @Column({ default: 'Not specified' })
  proficiency!: string;

  @Column({ default: 'resume' })
  source!: string;

  @CreateDateColumn()
  createdAt!: Date;
}