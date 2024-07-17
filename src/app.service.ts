import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(AppService.name);
  }

  private readonly URL = this.configService.get<string>(`app.healthUrl`);

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.URL));
      this.logger.debug(
        '[MAINTAIN SERVER JOB]: Request successful:',
        response.data,
      );
    } catch (error) {
      this.logger.error('[MAINTAIN SERVER JOB] Error during request:', error);
    }
  }
}
