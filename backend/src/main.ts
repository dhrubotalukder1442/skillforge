import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://skillforge-virid-nine.vercel.app', // তোমার main production domain
      ];

      // origin না থাকলে (যেমন Postman/server-to-server) allow করো
      if (!origin) return callback(null, true);

      // exact match অথবা যেকোনো vercel.app preview subdomain allow করো
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/skillforge-.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();