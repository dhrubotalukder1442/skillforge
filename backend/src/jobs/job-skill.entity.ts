import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from './job.entity';
import { Skill } from '../skills/skill.entity';

@Entity()
export class JobSkill {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job!: Job;

  @Column()
  jobId!: number;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill!: Skill;

  @Column()
  skillId!: number;
}