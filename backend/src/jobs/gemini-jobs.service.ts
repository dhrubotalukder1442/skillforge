import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiJobsService {
  private readonly logger = new Logger(GeminiJobsService.name);
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateSkillsForRole(jobTitle: string): Promise<string[]> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `List the 8-10 most important technical and professional skills required for a "${jobTitle}" job role.
Respond ONLY with a JSON array of short skill names, nothing else. Example: ["Python", "SQL", "Communication"]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const skills = JSON.parse(cleaned);

      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      this.logger.warn(`Skill generation failed for "${jobTitle}": ${error.message}`);
      return [];
    }
  }

  async suggestRoleNames(query: string): Promise<string[]> {
  try {
    const model = this.client.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `The user is typing a job role name and has typed: "${query}".
Suggest 3-5 realistic, standard job title names that closely match or complete what they might be typing.
Respond ONLY with a JSON array of strings, nothing else. Example: ["Product Manager", "Product Designer", "Product Analyst"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(cleaned);

    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    this.logger.warn(`Role suggestion failed for "${query}": ${error.message}`);
    return [];
  }
}
}