import { Controller, Get, Post, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from './interview.service';
import { JobsService } from '../jobs/jobs.service';

@Controller('interview')
export class InterviewController {
  constructor(
    private interviewService: InterviewService,
    private jobsService: JobsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getQuestions(@Query('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    const jobIdNum = parseInt(jobId, 10);

    if (!jobIdNum) {
      throw new BadRequestException('jobId is required');
    }

    const job = await this.jobsService.findOne(jobIdNum);
    const requiredSkills = await this.jobsService.getRequiredSkills(jobIdNum);
    const questionTexts = await this.interviewService.getQuestionsForJob(job.title, requiredSkills);

    const savedEntries: { id: number; question: string }[] = [];
    for (const q of questionTexts) {
      const entry = await this.interviewService.createQuestionEntry(userId, jobIdNum, q);
      savedEntries.push({ id: entry.id, question: entry.question });
    }

    return { questions: savedEntries };
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer')
  async saveAnswer(@Body() body: { interviewId: number; answer: string }, @Request() req) {
    const userId = req.user.userId;
    const { interviewId, answer } = body;

    if (!interviewId || !answer) {
      throw new BadRequestException('interviewId and answer are required');
    }

    const result = await this.interviewService.saveAnswer(interviewId, userId, answer);

    if (!result) {
      throw new BadRequestException('Interview question not found');
    }

    return { message: 'Answer saved', interviewId: result.id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSummary(@Query('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    const jobIdNum = parseInt(jobId, 10);

    if (!jobIdNum) {
      throw new BadRequestException('jobId is required');
    }

    const job = await this.jobsService.findOne(jobIdNum);
    const summary = await this.interviewService.generateSummary(userId, jobIdNum, job.title);

    if (!summary) {
      throw new BadRequestException('Could not generate summary. Try again.');
    }

    return summary;
  }
}