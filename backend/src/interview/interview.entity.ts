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

  @CreateDateColumn()
  createdAt!: Date;
}