import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning();
  const configService = app.get<ConfigService>(ConfigService);
  const redisClient = createClient({
    url: 'redis://redis',
  });
  redisClient.connect().catch((err) => {
    console.error(err);
  });
  const redisStore = new RedisStore({
    client: redisClient,
  });
  app.use(
    session({
      store: redisStore,
      name: 'bloggin-session',
      secret: configService.getOrThrow('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
