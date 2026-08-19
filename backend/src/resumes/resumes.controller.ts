import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumesService } from './resumes.service';
import { SkillsService, MatchedSkill } from '../skills/skills.service';

@Controller('resumes')
export class ResumesController {
  constructor(
    private resumesService: ResumesService,
    private skillsService: SkillsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new BadRequestException('Only PDF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadResume(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.userId;
    const resume = await this.resumesService.create(file.originalname, file.path, userId);

    const skillsResult = await this.resumesService.extractSkills(file.path, file.originalname);
    const matchedSkills: MatchedSkill[] = skillsResult.matchedSkills || [];

    if (matchedSkills.length > 0) {
      await this.skillsService.saveUserSkills(userId, matchedSkills, 'resume');
    }

    return {
      message: 'Resume uploaded successfully',
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
      },
      skills: matchedSkills,
      totalSkillsFound: skillsResult.totalSkillsFound,
    };
  }
}