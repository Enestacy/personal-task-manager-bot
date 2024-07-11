import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { TaskService } from '../task/task.service';

@Injectable()
export class TelegramBotService {
  private bot: TelegramBot;
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly taskService: TaskService,
  ) {
    this.logger = new Logger(TelegramBotService.name);
    this.bot = new TelegramBot(
      this.configService.get<string>(`telegram-bot.token`),
      {
        polling: true,
      },
    );
  }
  public initBot() {
    this.logger.log('Initializing TG Bot');
    const mainMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start', callback_data: 'start' }],
          [{ text: 'Help', callback_data: 'help' }],
          [{ text: 'Sync Task Data', callback_data: 'sync' }],
        ],
        is_persistent: true,
      },
    };

    this.bot.on('message', (msg) => {
      if (!msg.text.match(/\/(start|help|menu)/)) {
        this.bot.sendMessage(
          msg.chat.id,
          'Пожалуйста, используйте меню команд.',
        );
      }
    });

    this.bot.onText(/\/menu/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Добро пожаловать в меню. Выберите опцию:',
        mainMenu,
      );
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      if (callbackQuery.data === 'start') {
        this.bot.sendMessage(message.chat.id, 'Вы нажали Start!');
        return;
      }

      if (callbackQuery.data === 'help') {
        this.bot.sendMessage(message.chat.id, 'Вы нажали Help!');
        return;
      }

      if (callbackQuery.data === 'sync') {
        this.bot.sendMessage(
          message.chat.id,
          'Синхронизирую данные. Сообщу, когда все будет готово',
        );
        await this.taskService.syncTaskData();
        this.bot.sendMessage(message.chat.id, 'Готово');
        return;
      }
    });
  }
}
