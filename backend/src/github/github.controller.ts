import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GitHubService } from './github.service';
import { SkillsService } from '../skills/skills.service';

@Controller('github')
export class GitHubController {
  constructor(
    private githubService: GitHubService,
    private skillsService: SkillsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async connectGitHub(@Body() body: { githubUsername: string }, @Request() req) {
    const userId = req.user.userId;
    const { githubUsername } = body;

    if (!githubUsername) {
      throw new BadRequestException('githubUsername is required');
    }

    const repos = await this.githubService.fetchRepos(githubUsername);
    const matchedSkills = this.githubService.extractSkillsFromRepos(repos);

    if (matchedSkills.length > 0) {
      await this.skillsService.saveUserSkills(userId, matchedSkills, 'github');
    }

    await this.githubService.saveAnalysis(userId, githubUsername, repos.length);

    return {
      message: 'GitHub analyzed successfully',
      githubUsername,
      reposAnalyzed: repos.length,
      skills: matchedSkills,
    };
  }
}