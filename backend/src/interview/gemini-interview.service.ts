import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiInterviewService {
  private readonly logger = new Logger(GeminiInterviewService.name);
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async gradeAnswer(
    question: string,
    answer: string,
  ): Promise<{ score: number | null; feedback: string | null }> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `You are a technical interviewer evaluating a candidate's answer.

Question: "${question}"
Candidate's answer: "${answer}"

Rate the answer's technical accuracy and completeness on a scale of 1-5 (1 = poor/incorrect, 5 = excellent and thorough).
Then write 1-2 sentences of short, constructive feedback — what was good, and what could be improved.

Respond ONLY with valid JSON in this exact format, nothing else:
{"score": <number 1-5>, "feedback": "<short feedback text>"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const score = typeof parsed.score === 'number' ? parsed.score : null;
      const feedback = typeof parsed.feedback === 'string' ? parsed.feedback : null;

      return { score, feedback };
    } catch (error) {
      this.logger.warn(`Answer grading failed: ${error.message}`);
      return { score: null, feedback: null };
    }
  }

  async generateQuestions(
    jobTitle: string,
    requiredSkills: string[],
  ): Promise<string[]> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const skillsList = requiredSkills.length > 0 ? requiredSkills.join(', ') : 'general software engineering';

      const prompt = `You are a technical interviewer preparing questions for a candidate applying for the role: "${jobTitle}".

Required skills for this role: ${skillsList}

Generate 6-8 technical interview questions that test the candidate's knowledge of these skills, relevant to the "${jobTitle}" role. Mix conceptual and practical questions. Keep each question concise (1-2 sentences).

Respond ONLY with valid JSON in this exact format, nothing else:
{"questions": ["question 1", "question 2", ...]}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.questions)) {
        return parsed.questions.filter((q: unknown) => typeof q === 'string');
      }

      return [];
    } catch (error) {
      this.logger.warn(`Question generation failed: ${error.message}`);
      return [];
    }
  }
}