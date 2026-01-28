import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const configService = app.get(ConfigService);

  app.useLogger(logger);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors({
    origin: [
      configService.get("CORS_ORIGIN", "*"),
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Car Wish API")
    .setDescription("API para sistema de gestão de lava-jato")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = configService.get("PORT", 3000);
  await app.listen(port, () => {
    logger.log(`Application is running on: ${port}`);
    logger.log(`Swagger is available at: http://localhost:${port}/docs`);
  });
}

void bootstrap();
