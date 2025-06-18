import { Logger as NestLogger } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';

export class TypeOrmLogger implements Logger {
  private readonly logger = new NestLogger('TypeORM');

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.log(`\x1b[36m[QUERY]\x1b[0m ${query}`);
    if (parameters && parameters.length) {
      this.logger.log(`\x1b[33m[PARAMETERS]\x1b[0m ${JSON.stringify(parameters)}`);
    }
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.error(`\x1b[31m[QUERY ERROR]\x1b[0m ${error}`);
    this.logger.error(`\x1b[31m[QUERY]\x1b[0m ${query}`);
    if (parameters && parameters.length) {
      this.logger.error(`\x1b[31m[PARAMETERS]\x1b[0m ${JSON.stringify(parameters)}`);
    }
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.warn(`\x1b[33m[SLOW QUERY]\x1b[0m ${time}ms - ${query}`);
    if (parameters && parameters.length) {
      this.logger.warn(`\x1b[33m[PARAMETERS]\x1b[0m ${JSON.stringify(parameters)}`);
    }
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`\x1b[35m[SCHEMA]\x1b[0m ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`\x1b[34m[MIGRATION]\x1b[0m ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
        break;
      case 'warn':
        this.logger.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
        break;
    }
  }
} 