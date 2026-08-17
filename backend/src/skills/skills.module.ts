import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './skill.entity';
import { UserSkill } from './user-skill.entity';
import { SkillsService } from './skills.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, UserSkill])],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}