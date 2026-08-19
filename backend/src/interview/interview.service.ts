import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { QUESTIONS, DEFAULT_QUESTIONS } from './questions-data';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
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
    return this.interviewRepository.save(interview);
  }

  async getHistory(userId: number) {
    return this.interviewRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}