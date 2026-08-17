import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobSkill } from './job-skill.entity';
import { SkillsService } from '../skills/skills.service';

const SEED_JOBS: Record<string, string[]> = {
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Next.js', 'Tailwind CSS'],
  'Backend Developer': ['Node.js', 'Express', 'NestJS', 'PostgreSQL', 'REST API', 'Docker', 'Git'],
  'Full-Stack Developer': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'NestJS', 'PostgreSQL', 'MongoDB', 'REST API', 'Git', 'Docker',
  ],
  'Data Analyst': ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Machine Learning'],
  'AI / ML Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'NLP'],
};

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobSkill)
    private jobSkillsRepository: Repository<JobSkill>,
    private skillsService: SkillsService,
  ) {}

  async onModuleInit() {
    await this.seedJobs();
  }

  private async seedJobs() {
    for (const [title, skillNames] of Object.entries(SEED_JOBS)) {
      let job = await this.jobsRepository.findOne({ where: { title } });
      if (!job) {
        job = this.jobsRepository.create({ title });
        job = await this.jobsRepository.save(job);
      }

      for (const skillName of skillNames) {
        const skill = await this.skillsService.findOrCreateSkill(skillName);

        const existing = await this.jobSkillsRepository.findOne({
          where: { jobId: job.id, skillId: skill.id },
        });

        if (!existing) {
          const jobSkill = this.jobSkillsRepository.create({
            jobId: job.id,
            skillId: skill.id,
          });
          await this.jobSkillsRepository.save(jobSkill);
        }
      }
    }
  }

  async getAllJobs() {
    return this.jobsRepository.find();
  }

  async getRequiredSkills(jobId: number) {
    const jobSkills = await this.jobSkillsRepository.find({
      where: { jobId },
      relations: { skill: true },
    });
    return jobSkills.map((js) => js.skill.name);
  }
}