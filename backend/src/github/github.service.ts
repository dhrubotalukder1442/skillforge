import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { GitHubAnalysis } from './github-analysis.entity';

const SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Go', 'Ruby',
  'Swift', 'Kotlin', 'HTML', 'CSS', 'React', 'Vue', 'Docker', 'Shell', 'Rust',
];

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

  extractSkillsFromRepos(repos: any[]): string[] {
    const foundLanguages = new Set<string>();

    for (const repo of repos) {
      if (repo.language) {
        foundLanguages.add(repo.language);
      }
      if (Array.isArray(repo.topics)) {
        for (const topic of repo.topics) {
          foundLanguages.add(topic);
        }
      }
    }

    const matched: string[] = [];
    for (const skill of SKILLS) {
      const isMatch = Array.from(foundLanguages).some(
        (lang) => lang.toLowerCase() === skill.toLowerCase(),
      );
      if (isMatch) {
        matched.push(skill);
      }
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