import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roadmap } from './roadmap.entity';
import { RoadmapStep } from './roadmap-step.entity';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';
import { SkillsModule } from '../skills/skills.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Roadmap, RoadmapStep]), SkillsModule, JobsModule],
  providers: [RoadmapService],
  controllers: [RoadmapController],
})
export class RoadmapModule {}