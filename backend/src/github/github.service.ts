import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { GitHubAnalysis } from './github-analysis.entity';

const SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Go', 'Ruby',
  'Swift', 'Kotlin', 'HTML', 'CSS', 'React', 'Vue', 'Docker', 'Shell', 'Rust',
];

export interface GitHubMatchedSkill {
  skill: string;
  proficiency: string;
}

@Injectable()
export class GitHubService {
  constructor(
    @InjectRepository(GitHubAnalysis)
    private githubAnalysisRepository: Repository<GitHubAnalysis>,
  ) {}

  async fetchRepos(username: string) {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
        params: { per_page: 100 },
        headers: { 'User-Agent': 'SkillForge-App' },
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException('Could not fetch GitHub repos. Check the username and try again.');
    }
  }

  private proficiencyFromRepoCount(count: number): string {
    if (count >= 4) return 'Expert';
    if (count >= 2) return 'Intermediate';
    return 'Beginner';
  }

  extractSkillsFromRepos(repos: any[]): GitHubMatchedSkill[] {
    // Count how many repos mention each skill (as primary language or topic)
    const skillRepoCount = new Map<string, number>();

    for (const repo of repos) {
      const tagsInRepo = new Set<string>();

      if (repo.language) {
        tagsInRepo.add(repo.language.toLowerCase());
      }
      if (Array.isArray(repo.topics)) {
        for (const topic of repo.topics) {
          tagsInRepo.add(topic.toLowerCase());
        }
      }

      for (const skill of SKILLS) {
        if (tagsInRepo.has(skill.toLowerCase())) {
          skillRepoCount.set(skill, (skillRepoCount.get(skill) || 0) + 1);
        }
      }
    }

    const matched: GitHubMatchedSkill[] = [];
    for (const [skill, count] of skillRepoCount.entries()) {
      matched.push({
        skill,
        proficiency: this.proficiencyFromRepoCount(count),
      });
    }

    return matched;
  }

  async saveAnalysis(userId: number, githubUsername: string, reposCount: number) {
    const analysis = this.githubAnalysisRepository.create({
      userId,
      githubUsername,
      reposAnalyzed: reposCount,
    });
    return this.githubAnalysisRepository.save(analysis);
  }
}