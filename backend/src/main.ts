import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for Angular frontend
  app.enableCors({
    origin: ["http://localhost:4200"],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // API prefix
  app.setGlobalPrefix("api");

  const port = configService.get("PORT") || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();
