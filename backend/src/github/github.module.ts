import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitHubAnalysis } from './github-analysis.entity';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [TypeOrmModule.forFeature([GitHubAnalysis]), SkillsModule],
  providers: [GitHubService],
  controllers: [GitHubController],
})
export class GitHubModule {}