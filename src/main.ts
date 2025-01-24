import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramBotService } from './modules/telegram-bot';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.APP_PORT);

  const telegramService = app.get(TelegramBotService);
  telegramService.initBot();
}
bootstrap();
