import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { JobsModule } from '../jobs/jobs.module';
import { GeminiService } from './gemini.service';


@Module({
  imports: [TypeOrmModule.forFeature([Interview]), JobsModule],
  providers: [InterviewService, GeminiService],
  controllers: [InterviewController],
})
export class InterviewModule {}