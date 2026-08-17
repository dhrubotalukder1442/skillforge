import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resume.entity';
import * as fs from 'fs';
import axios from 'axios';
import FormData = require('form-data');

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private resumesRepository: Repository<Resume>,
  ) {}

  async create(fileName: string, filePath: string, userId: number) {
    const resume = this.resumesRepository.create({
      fileName,
      filePath,
      userId,
    });

    return this.resumesRepository.save(resume);
  }

  async findByUser(userId: number) {
    return this.resumesRepository.find({ where: { userId } });
  }

  async extractSkills(filePath: string, fileName: string) {
    try {
      const fileBuffer = fs.readFileSync(filePath);

      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);

      const response = await axios.post(
        'http://127.0.0.1:8000/extract-skills',
        formData,
        { headers: formData.getHeaders() },
      );

      return response.data;
    } catch (error) {
      return { matchedSkills: [], totalSkillsFound: 0, error: 'AI service unavailable' };
    }
  }
}