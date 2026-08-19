import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';
import { UserSkill } from './user-skill.entity';

export interface MatchedSkill {
  skill: string;
  proficiency: string;
}

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillsRepository: Repository<UserSkill>,
  ) {}

  async findOrCreateSkill(name: string): Promise<Skill> {
    let skill = await this.skillsRepository.findOne({ where: { name } });
    if (!skill) {
      skill = this.skillsRepository.create({ name });
      skill = await this.skillsRepository.save(skill);
    }
    return skill;
  }

  async saveUserSkills(
    userId: number,
    skills: (string | MatchedSkill)[],
    source = 'resume',
  ) {
    // Normalize: GitHub sends plain strings (no proficiency signal available),
    // resume sends { skill, proficiency } objects.
    const normalized: MatchedSkill[] = skills.map((item) =>
      typeof item === 'string'
        ? { skill: item, proficiency: 'Not specified' }
        : item,
    );

    for (const { skill: name, proficiency } of normalized) {
      const skill = await this.findOrCreateSkill(name);

      const existing = await this.userSkillsRepository.findOne({
        where: { userId, skillId: skill.id },
      });

      if (!existing) {
        const userSkill = this.userSkillsRepository.create({
          userId,
          skillId: skill.id,
          proficiency,
          source,
        });
        await this.userSkillsRepository.save(userSkill);
      } else {
        existing.proficiency = proficiency;
        await this.userSkillsRepository.save(existing);
      }
    }
  }

  async getUserSkills(userId: number) {
    const userSkills = await this.userSkillsRepository.find({
      where: { userId },
      relations: { skill: true },
    });

    return userSkills.map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
      proficiency: us.proficiency,
      source: us.source,
    }));
  }
}