import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private client: GoogleGenerativeAI;

  constructor() {
  const key = process.env.GEMINI_API_KEY;
  this.logger.warn(`GEMINI_API_KEY loaded: ${key ? 'YES (length ' + key.length + ')' : 'NO - undefined/empty'}`);
  this.client = new GoogleGenerativeAI(key || '');
}

  private getModel() {
    return this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });
  }

  async generateQuestions(jobTitle: string, requiredSkills: string[]): Promise<string[]> {
    try {
      const model = this.getModel();

      const prompt = `Generate 15 realistic mock interview questions for a "${jobTitle}" role, focused on these required skills: ${requiredSkills.join(', ')}.
Mix technical and behavioral questions relevant to the role.
Respond ONLY with a JSON array of strings, nothing else. Example: ["question 1", "question 2"]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const cleaned = text.replace(/```json|```/g, '').trim();
      const questions = JSON.parse(cleaned);

      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      this.logger.warn(`Question generation failed, will use fallback: ${error.message}`);
      return [];
    }
  }

  async generateInterviewSummary(
    jobTitle: string,
    qaPairs: { question: string; answer: string }[],
  ): Promise<{ score: number; strengths: string[]; improvements: string[]; summary: string } | null> {
    try {
      const model = this.getModel();

      const transcript = qaPairs
        .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer || '(no answer given)'}`)
        .join('\n\n');

      const prompt = `You are an interview coach reviewing a mock interview transcript for a "${jobTitle}" role.

${transcript}

Evaluate the candidate's answers overall. Respond ONLY with valid JSON in this exact shape, nothing else:
{
  "score": <integer 0-100>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "summary": "<2-3 sentence overall summary>"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.warn(`Summary generation failed: ${error.message}`);
      return null;
    }
  }
}