import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiRoadmapService {
  private readonly logger = new Logger(GeminiRoadmapService.name);
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateAdvice(
    jobTitle: string,
    existingSkills: string[],
    missingSkills: string[],
  ): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `A person is targeting a "${jobTitle}" role.
They already have these skills: ${existingSkills.join(', ') || 'none listed'}.
They are missing these required skills: ${missingSkills.join(', ')}.

Write a short, encouraging, personalized paragraph (3-4 sentences) advising them on how to approach closing this skill gap. Mention which missing skill to prioritize first and why, considering their existing skills as a foundation. Keep it practical and specific, not generic.

Respond ONLY with the paragraph text, no headers, no markdown, no quotes.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return text.trim();
    } catch (error) {
      this.logger.warn(`Roadmap advice generation failed for "${jobTitle}": ${error.message}`);
      return '';
    }
  }

  async suggestStepOrder(missingSkills: string[]): Promise<string[]> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `A learner needs to acquire these skills in some order: ${missingSkills.join(', ')}.
Reorder them into the most logical learning sequence, where foundational/prerequisite skills come first.
Respond ONLY with a JSON array containing the exact same skill names, just reordered. Example: ["HTML", "CSS", "JavaScript", "React"]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const ordered = JSON.parse(cleaned);

      if (
        Array.isArray(ordered) &&
        ordered.length === missingSkills.length &&
        ordered.every((s) => missingSkills.includes(s))
      ) {
        return ordered;
      }

      return missingSkills;
    } catch (error) {
      this.logger.warn(`Step ordering failed: ${error.message}`);
      return missingSkills;
    }
  }
}