import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Roadmap } from './roadmap.entity';
import { Skill } from '../skills/skill.entity';

@Entity()
export class RoadmapStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Roadmap)
  @JoinColumn({ name: 'roadmapId' })
  roadmap!: Roadmap;

  @Column()
  roadmapId!: number;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill!: Skill;

  @Column()
  skillId!: number;

  @Column()
  resourceTitle!: string;

  @Column()
  resourceUrl!: string;

  @Column()
  order!: number;

  @Column({ default: 'not_started' })
  status!: string;
}