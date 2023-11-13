import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CustomRedisService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  async set(key: string, value: any | any[]): Promise<number> {
    const stringifiedValues = Array.isArray(value)
      ? value.map((val) => JSON.stringify(val))
      : [JSON.stringify(value)];
    return this.redis.rpush(key, ...stringifiedValues);
  }

  async get<T>(key: string): Promise<T[] | null> {
    try {
      const values = await this.redis.lrange(key, 0, -1);

      if (!values || values.length === 0) {
        return null;
      }

      return values.map((value) => JSON.parse(value)) as T[];
    } catch (error) {
      console.log(`Unable to get from Redis`, error);
      throw new InternalServerErrorException();
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.log(`Unable to delete from Redis`, error);
      throw new InternalServerErrorException();
    }
  }
}
