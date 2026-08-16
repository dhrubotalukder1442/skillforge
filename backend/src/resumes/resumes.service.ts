import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resume.entity';

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
}