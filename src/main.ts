import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { PrismaService } from './prisma/prisma.service';
import { env } from 'process';
//import * as csurf from 'csurf';
//import helmet from 'helmet';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: true,
  });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.use(cookieParser());
  app.use(
    session({
      name: 'sid',
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: false,
        httpOnly: false,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(env.PORT ? env.PORT : 3000);
  //app.use(csurf());
  //app.use(helmet());
  console.log(process.env.NODE_ENV);
  console.log(process.env.NODE_ENV === 'production');
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
