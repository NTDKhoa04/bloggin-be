import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

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
  let redisStore = new RedisStore({
    client: redisClient,
  });
  app.use(
    session({
      store: redisStore,
      name: 'bloggin-session',
      secret: configService.getOrThrow('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60,
        httpOnly: true,
        secure: false,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
