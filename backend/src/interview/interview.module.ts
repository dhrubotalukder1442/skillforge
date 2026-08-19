import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), JobsModule],
  providers: [InterviewService],
  controllers: [InterviewController],
})
export class InterviewModule {}