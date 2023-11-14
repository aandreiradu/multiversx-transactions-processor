import { Logger } from '@nestjs/common';

export class LockResource {
  private static lockArray: string[] = [];

  static async lock(key: string, func: () => Promise<void>, log = false) {
    const logger = new Logger('Lock');

    if (LockResource.lockArray.includes(key) && log) {
      logger.log(`${key} is already running`);
      return;
    }

    LockResource.lockArray.push(key);

    try {
      await func();
    } catch (error) {
      logger.error(`Error running ${key}`);
      logger.error(error);
    } finally {
      const index = LockResource.lockArray.indexOf(key);
      if (index >= 0) {
        LockResource.lockArray.splice(index, 1);
      }
    }
  }
}
