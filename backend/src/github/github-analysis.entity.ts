import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class GitHubAnalysis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  githubUsername!: string;

  @Column({ default: 0 })
  reposAnalyzed!: number;

  @CreateDateColumn()
  analyzedAt!: Date;
}