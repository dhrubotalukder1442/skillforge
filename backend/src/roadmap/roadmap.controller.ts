import { Controller, Post, Get, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoadmapService } from './roadmap.service';
import { JobsService } from '../jobs/jobs.service';
import { SkillsService } from '../skills/skills.service';

@Controller('roadmap')
export class RoadmapController {
  constructor(
    private roadmapService: RoadmapService,
    private jobsService: JobsService,
    private skillsService: SkillsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateRoadmap(@Query('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    const jobIdNum = parseInt(jobId, 10);

    if (!jobIdNum) {
      throw new BadRequestException('jobId is required');
    }

    const requiredSkills = await this.jobsService.getRequiredSkills(jobIdNum);
    const userSkills = await this.skillsService.getUserSkills(userId);
    const userSkillNames = userSkills.map((s) => s.name);

    const missingSkills = requiredSkills.filter((skill) => !userSkillNames.includes(skill));

    return this.roadmapService.generate(userId, jobIdNum, missingSkills);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyRoadmap(@Request() req) {
    const userId = req.user.userId;
    return this.roadmapService.getLatestForUser(userId);
  }
}