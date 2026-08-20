import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobSkill } from './job-skill.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SkillsModule } from '../skills/skills.module';
import { GeminiJobsService } from './gemini-jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobSkill]), SkillsModule],
  providers: [JobsService, GeminiJobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}