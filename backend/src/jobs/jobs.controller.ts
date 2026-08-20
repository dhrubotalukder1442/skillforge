import { Controller, Get, Post, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { SkillsService } from '../skills/skills.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private skillsService: SkillsService,
  ) {}

  @Get()
  async getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('gap')
  async getSkillGap(@Query('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    const jobIdNum = parseInt(jobId, 10);

    const requiredSkills = await this.jobsService.getRequiredSkills(jobIdNum);
    const userSkills = await this.skillsService.getUserSkills(userId);
    const userSkillNames = userSkills.map((s) => s.name);

    const matchedSkills = requiredSkills.filter((skill) => userSkillNames.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !userSkillNames.includes(skill));

    const readinessScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    return {
      requiredSkills,
      matchedSkills,
      missingSkills,
      readinessScore,
    };
  }

  @Get('search')
async searchJobs(@Query('q') query: string) {
  if (!query || query.trim().length < 1) {
    return [];
  }
  return this.jobsService.searchJobsWithAISuggestions(query.trim());
}

@Post('find-or-create')
async findOrCreateJob(@Body() body: { title: string }) {
  const title = body.title?.trim();
  if (!title) {
    throw new BadRequestException('title is required');
  }
  return this.jobsService.findOrCreateJobWithAI(title);
}
}