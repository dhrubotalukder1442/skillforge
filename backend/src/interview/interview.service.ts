import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { QUESTIONS, DEFAULT_QUESTIONS } from './questions-data';
import { GeminiService as ClaudeService } from './gemini.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private claudeService: ClaudeService,
  ) {}

  // Static fallback, used only if the AI call fails
  private getStaticQuestions(requiredSkills: string[]): string[] {
    const questions: string[] = [];
    for (const skill of requiredSkills) {
      const skillQuestions = QUESTIONS[skill];
      if (skillQuestions) questions.push(...skillQuestions);
    }
    return questions.length > 0 ? questions.slice(0, 8) : DEFAULT_QUESTIONS;
  }

  async getQuestionsForJob(jobTitle: string, requiredSkills: string[]): Promise<string[]> {
    const aiQuestions = await this.claudeService.generateQuestions(jobTitle, requiredSkills);

    if (aiQuestions.length > 0) {
      return aiQuestions;
    }

    // AI failed or returned nothing usable — fall back to static bank
    return this.getStaticQuestions(requiredSkills);
  }

  async createQuestionEntry(userId: number, jobId: number, question: string) {
    const interview = this.interviewRepository.create({
      userId,
      jobId,
      question,
      answer: null,
    });
    return this.interviewRepository.save(interview);
  }

  async saveAnswer(interviewId: number, userId: number, answer: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, userId },
    });
    if (!interview) return null;

    interview.answer = answer;
    return this.interviewRepository.save(interview);
  }

  async getHistory(userId: number) {
    return this.interviewRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSessionForJob(userId: number, jobId: number) {
    return this.interviewRepository.find({
      where: { userId, jobId },
      order: { createdAt: 'ASC' },
    });
  }

  async generateSummary(userId: number, jobId: number, jobTitle: string) {
    const session = await this.getSessionForJob(userId, jobId);

    if (session.length === 0) return null;

    const qaPairs = session.map((entry) => ({
      question: entry.question,
      answer: entry.answer || '',
    }));

    return this.claudeService.generateInterviewSummary(jobTitle, qaPairs);
  }
}