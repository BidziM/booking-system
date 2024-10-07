import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
  Res,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { IsNotEmpty, IsString, validate } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { Response, Request } from 'express';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { DeletePerformanceDto } from './dto/delete-performance.dto';
import { PresignedDto } from './dto/presigned-url.dto';
import { Performances } from '@prisma/client';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { S3Service } from 'src/services/s3/s3.service';
import { env } from 'process';

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  @UsePipes(ValidationPipe)
  create(
    @Body() performanceData: CreatePerformanceDto,
  ): Promise<Performances[]> {
    return this.performanceService.create(performanceData);
  }

  @Get()
  async findAll(@Req() req: Request) {
    return this.performanceService.findAll(req);
  }

  @Get(':url')
  findOne(@Param('url') url: string) {
    return this.performanceService.findOne(url);
  }

  @Post('presigned')
  @UseGuards(AuthenticatedGuard)
  @UsePipes(ValidationPipe)
  async getPresignedUrl(@Body() presigned: PresignedDto) {
    //await validate(presigned);
    const performanceData = await this.performanceService.getByNameAndData(
      presigned,
    );
    if (!performanceData) throw new NotFoundException();
    const presignedData = await this.s3Service.getSignedUrlForImage(
      presigned.contentType,
      presigned.filePath,
      performanceData.imageUrl,
    );
    if (!performanceData.imageUrl) {
      await this.performanceService.update({
        ...presigned,
        newImage:
          'https://' +
          env.S3_UPDATE_BUCKET +
          '.s3.amazonaws.com/' +
          presignedData.fileName,
      });
    }
    return presignedData.presignedUrl;
  }

  @Patch()
  @UseGuards(AuthenticatedGuard)
  @UsePipes(ValidationPipe)
  update(@Body() updatePerformanceDto: UpdatePerformanceDto) {
    return this.performanceService.update(updatePerformanceDto);
  }

  @Post('delete')
  @HttpCode(201)
  @UseGuards(AuthenticatedGuard)
  @UsePipes(ValidationPipe)
  async remove(
    @Body() performanceData: DeletePerformanceDto,
    @Res()
    res: Response,
  ) {
    if (!performanceData['delete']) performanceData['delete'] = false;
    const data = await this.performanceService.remove(performanceData);
    //Sprawdzamy czy funkcja zwrocila error("Czyli informacje czy uzytkownik jest na 100% pewien usuniecia") jesli tak to klient otrzyma status 202
    if (data['error'] !== undefined || data['error'] === false) {
      return res.status(HttpStatus.ACCEPTED).json(data['error']);
    }
    return res.status(HttpStatus.OK).send();
  }
}
