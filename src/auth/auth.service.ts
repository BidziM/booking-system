import {
  Injectable,
  NotAcceptableException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  createAdmin(email, password) {
    return this.prisma.admin.create({
      data: {
        email,
        password,
      },
    });
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user)
      throw new BadRequestException('User does not exist or wrong password');

    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.admin.findFirst({ where: { email } });
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (user && passwordValid) {
      return user;
    }
    return null;
  }
}
