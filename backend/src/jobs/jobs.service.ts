import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobSkill } from './job-skill.entity';
import { SkillsService } from '../skills/skills.service';
import { Like } from 'typeorm';
import { GeminiJobsService } from './gemini-jobs.service';

const SEED_JOBS: Record<string, string[]> = {
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Next.js', 'Tailwind CSS'],
  'Backend Developer': ['Node.js', 'Express', 'NestJS', 'PostgreSQL', 'REST API', 'Docker', 'Git'],
  'Full-Stack Developer': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'NestJS', 'PostgreSQL', 'MongoDB', 'REST API', 'Git', 'Docker',
  ],
  'Data Analyst': ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Machine Learning'],
  'AI / ML Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'NLP'],
};

type CachedSuggestion = {
  data: { id: number | null; title: string; isNew: boolean }[];
  expiresAt: number;
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MIN_QUERY_LENGTH = 2;

@Injectable()
export class JobsService implements OnModuleInit {
  private suggestionCache = new Map<string, CachedSuggestion>();
  private pendingRequests = new Map<string, Promise<{ id: number | null; title: string; isNew: boolean }[]>>();

  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobSkill)
    private jobSkillsRepository: Repository<JobSkill>,
    private skillsService: SkillsService,
    private geminiJobsService: GeminiJobsService,
  ) {}

  async searchJobs(query: string) {
    return this.jobsRepository.find({
      where: { title: Like(`%${query}%`) },
      take: 8,
    });
  }

  async findOrCreateJobWithAI(title: string) {
    // Case-insensitive exact match check first
    let job = await this.jobsRepository.findOne({ where: { title } });

    if (job) {
      return job;
    }

    // Not in DB yet — ask Gemini what skills this role needs
    const skillNames = await this.geminiJobsService.generateSkillsForRole(title);

    job = this.jobsRepository.create({ title });
    job = await this.jobsRepository.save(job);

    const skillList = skillNames.length > 0
      ? skillNames
      : ['Communication', 'Problem Solving']; // safety fallback

    for (const skillName of skillList) {
      const skill = await this.skillsService.findOrCreateSkill(skillName);
      const jobSkill = this.jobSkillsRepository.create({
        jobId: job.id,
        skillId: skill.id,
      });
      await this.jobSkillsRepository.save(jobSkill);
    }

    // A new job title now exists — invalidate the suggestion cache so
    // future searches for this query can find it in the DB immediately.
    this.suggestionCache.clear();

    return job;
  }

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

  async findOne(jobId: number) {
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new Error(`Job with id ${jobId} not found`);
    }
    return job;
  }

  async getRequiredSkills(jobId: number) {
    const jobSkills = await this.jobSkillsRepository.find({
      where: { jobId },
      relations: { skill: true },
    });
    return jobSkills.map((js) => js.skill.name);
  }

  async searchJobsWithAISuggestions(query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    // Too short — skip DB/AI entirely, nothing meaningful to search yet
    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return [];
    }

    // Serve from cache if we have a fresh result for this exact query
    const cached = this.suggestionCache.get(normalizedQuery);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // If an identical request is already in flight (e.g. rapid re-renders),
    // reuse that same promise instead of firing a duplicate Gemini call.
    const pending = this.pendingRequests.get(normalizedQuery);
    if (pending) {
      return pending;
    }

    const requestPromise = this.resolveSuggestions(query, normalizedQuery);
    this.pendingRequests.set(normalizedQuery, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(normalizedQuery);
    }
  }

  private async resolveSuggestions(query: string, normalizedQuery: string) {
    const dbMatches = await this.searchJobs(query);

    let result: { id: number | null; title: string; isNew: boolean }[];

    if (dbMatches.length > 0) {
      result = dbMatches.map((job) => ({ id: job.id, title: job.title, isNew: false }));
    } else {
      const aiSuggestions = await this.geminiJobsService.suggestRoleNames(query);
      result = aiSuggestions.map((title) => ({ id: null, title, isNew: true }));
    }

    this.suggestionCache.set(normalizedQuery, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  }
}