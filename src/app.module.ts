import { Module } from '@nestjs/common';
import { HealthController } from './modules/health';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { JiraModule } from './modules/jira/jira.module';
import telegramConfig from './config/telegram.config';
import jiraConfig from './config/jira.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { TaskModule } from './modules/task/task.module';
import dbConfig from 'db/config/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
      ],
      isGlobal: true,
      cache: true,
      load: [telegramConfig, jiraConfig, dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<{ database: DataSourceOptions }, true>,
      ) => configService.get('database'),
    }),
    TelegramBotModule,
    JiraModule,
    TaskModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
