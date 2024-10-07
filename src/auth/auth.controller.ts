import {
  Body,
  Controller,
  Post,
  Response,
  Request,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import * as bcrypt from 'bcrypt';
import { Admin } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseGuards(AuthenticatedGuard)
  async createAdmin(
    @Body('password') password: string,
    @Body('email') email: string,
  ): Promise<Admin> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const result = await this.authService.createAdmin(email, hashedPassword);
    return result;
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login() {
    return;
  }

  //Get / protected
  @UseGuards(AuthenticatedGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }
}
