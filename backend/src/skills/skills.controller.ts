import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMySkills(@Request() req) {
    const userId = req.user.userId;
    const skills = await this.skillsService.getUserSkills(userId);

    return {
      skills,
      totalSkillsFound: skills.length,
    };
  }
}