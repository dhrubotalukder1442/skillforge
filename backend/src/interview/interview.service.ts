import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { QUESTIONS, DEFAULT_QUESTIONS } from './questions-data';
import { GeminiInterviewService } from './gemini-interview.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private geminiInterviewService: GeminiInterviewService,
  ) {}

  getQuestionsForSkills(requiredSkills: string[]): string[] {
    const questions: string[] = [];

    for (const skill of requiredSkills) {
      const skillQuestions = QUESTIONS[skill];
      if (skillQuestions) {
        questions.push(...skillQuestions);
      }
    }

    if (questions.length === 0) {
      return DEFAULT_QUESTIONS;
    }

    return questions.slice(0, 8);
  }

  async getQuestionsForJob(jobTitle: string, requiredSkills: string[]): Promise<string[]> {
    const aiQuestions = await this.geminiInterviewService.generateQuestions(jobTitle, requiredSkills);

    if (aiQuestions && aiQuestions.length > 0) {
      return aiQuestions.slice(0, 8);
    }

    return this.getQuestionsForSkills(requiredSkills);
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

    if (!interview) {
      return null;
    }

    interview.answer = answer;

    const { score, feedback } = await this.geminiInterviewService.gradeAnswer(
      interview.question,
      answer,
    );

    interview.score = score;
    interview.feedback = feedback;

    return this.interviewRepository.save(interview);
  }

  async getHistory(userId: number) {
    return this.interviewRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async generateSummary(userId: number, jobId: number, jobTitle: string) {
    const entries = await this.interviewRepository.find({
      where: { userId, jobId },
      order: { createdAt: 'ASC' },
    });

    const answered = entries.filter(
      (e) => e.answer !== null && e.answer !== undefined,
    );

    if (answered.length === 0) {
      return null;
    }

    const totalScore = answered.reduce((sum, e) => sum + (e.score ?? 0), 0);
    const averageScore = Math.round((totalScore / answered.length) * 10) / 10;

    return {
      jobTitle,
      totalQuestions: entries.length,
      answeredQuestions: answered.length,
      averageScore,
      breakdown: answered.map((e) => ({
        question: e.question,
        answer: e.answer,
        score: e.score,
        feedback: e.feedback,
      })),
    };
  }
}