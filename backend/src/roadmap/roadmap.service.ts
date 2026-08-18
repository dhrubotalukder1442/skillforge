import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roadmap } from './roadmap.entity';
import { RoadmapStep } from './roadmap-step.entity';
import { SkillsService } from '../skills/skills.service';
import { RESOURCES, DEFAULT_RESOURCE } from './resources-data';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
    @InjectRepository(RoadmapStep)
    private roadmapStepRepository: Repository<RoadmapStep>,
    private skillsService: SkillsService,
  ) {}

  async generate(userId: number, jobId: number, missingSkills: string[]) {
    const roadmap = this.roadmapRepository.create({ userId, jobId });
    const savedRoadmap = await this.roadmapRepository.save(roadmap);

    let order = 1;
    for (const skillName of missingSkills) {
      const skill = await this.skillsService.findOrCreateSkill(skillName);
      const resource = RESOURCES[skillName] || DEFAULT_RESOURCE;

      const step = this.roadmapStepRepository.create({
        roadmapId: savedRoadmap.id,
        skillId: skill.id,
        resourceTitle: resource.title,
        resourceUrl: resource.url,
        order,
        status: 'not_started',
      });
      await this.roadmapStepRepository.save(step);
      order++;
    }

    return this.getRoadmapWithSteps(savedRoadmap.id);
  }

  async getRoadmapWithSteps(roadmapId: number) {
    const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });
    const steps = await this.roadmapStepRepository.find({
      where: { roadmapId },
      relations: { skill: true },
      order: { order: 'ASC' },
    });

    return {
      id: roadmap?.id,
      generatedAt: roadmap?.generatedAt,
      steps: steps.map((s) => ({
        id: s.id,
        skillName: s.skill.name,
        resourceTitle: s.resourceTitle,
        resourceUrl: s.resourceUrl,
        order: s.order,
        status: s.status,
      })),
    };
  }

  async getLatestForUser(userId: number) {
    const roadmap = await this.roadmapRepository.findOne({
      where: { userId },
      order: { generatedAt: 'DESC' },
    });

    if (!roadmap) return null;

    return this.getRoadmapWithSteps(roadmap.id);
  }
}