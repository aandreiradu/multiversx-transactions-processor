import { Logger } from '@nestjs/common';

export class LockResource {
  private static lockArray: string[] = [];

  static async lock(key: string, callbackFn: () => void) {
    const logger: Logger = new Logger(LockResource.name);

    if (LockResource.lockArray.includes(key)) {
      return;
    }

    LockResource.lockArray.push(key);

    try {
      await callbackFn();
    } catch (error) {
      logger.error(
        `Unable to lock resource with key => ${key}; error => ${JSON.stringify(
          error,
        )}`,
      );
    } finally {
      /*
       * Check if the key was not removed by another service. If it's still present, remove the key to unlock the resource
       */
      LockResource.lockArray.indexOf(key) > 0 &&
        LockResource.lockArray.splice(LockResource.lockArray.indexOf(key), 1);
    }
  }
}
