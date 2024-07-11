import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { TaskService } from '../task/task.service';
import { forEachPromise } from 'src/common/helpers';
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
    this.logger.log('Initialized TG Bot');
    const mainMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help' }],
          [{ text: 'Sync Task Data', callback_data: 'sync' }],
        ],
        is_persistent: false,
      },
    };

    this.bot.onText(/^\d+$/, async (msg) => {
      const task = await this.taskService.getTaskByKey(msg.text);
      if (!task?.id) {
        this.bot.sendMessage(msg.chat.id, `Таска с таким номером не найдена `);
        return;
      }

      const reply = this.taskService.buildTaskReport(task);
      this.bot.sendMessage(msg.chat.id, reply, { parse_mode: 'Markdown' });
    });

    this.bot.onText(/^(\d+):\s*(.*)$/, async (msg) => {
      const regex = /^(\d+):\s*(.*)$/;
      const match = msg.text.match(regex);
      const taskNumber = match[1];
      const comment = match[2];

      const task = await this.taskService.getTaskByKey(taskNumber);
      if (!task?.id) {
        this.bot.sendMessage(msg.chat.id, `Таска с таким номером не найдена `);
        return;
      }

      await this.taskService.update(task.id, { comments: comment });
      this.bot.sendMessage(
        msg.chat.id,
        `Таска с номером ${taskNumber} успешно обновлена`,
      );
    });

    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Добро пожаловать в меню. Выберите опцию:',
        mainMenu,
      );
    });

    this.bot.onText(/\/report/, (msg) => {
      const chatId = msg.chat.id;
      this.bot
        .sendMessage(
          chatId,
          `Отправьте мне номера тасок, которые включить в отчет, через запятую в ответ на это сообщение
Рекомендую произвести синхронизацию данных перед генерацией отчета`,
        )
        .then(() => {
          const listener = async (replyMsg: TelegramBot.Message) => {
            this.bot.sendMessage(replyMsg.chat.id, `Подготавливаю отчет ... `);
            const taskNumbers = replyMsg.text.split(',');
            let taskReport = '';
            await forEachPromise(
              taskNumbers,
              async (taskNumber: string, index) => {
                const current = await this.taskService.getTaskByKey(taskNumber);
                if (!current?.id) {
                  taskReport += `${index + 1}. Таска номер ${taskNumber} не найдена \n\n`;
                  return;
                }
                const taskInfo = this.taskService.buildTaskReport(current);
                taskReport += `${index + 1}. ${taskInfo} \n\n`;
              },
            );
            this.bot.sendMessage(
              replyMsg.chat.id,
              `**Отчет по таскам** \n ${taskReport}`,
              { parse_mode: 'Markdown' },
            );
            this.bot.removeListener('message', listener);
          };
          this.bot.on('message', listener);
        });
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      if (callbackQuery.data === 'help') {
        this.bot.sendMessage(
          message.chat.id,
          '1. Для того, чтобы обновить комментарий к задаче, пришлите мне сообщение в формате <номер таски>: <комментарий> \n 2. Для генерации отчета воспользуйтесь командой /report',
        );
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
