import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Interview {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  jobId!: number;

  @Column('text')
  question!: string;

  @Column('text', { nullable: true })
  answer!: string | null;

  @Column('int', { nullable: true })
  score!: number | null;

  @Column('text', { nullable: true })
  feedback!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}