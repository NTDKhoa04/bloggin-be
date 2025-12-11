import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis.RedisClientType;

  constructor() {
    this.redisClient = Redis.createClient({ url: 'redis://redis:6379' });
    this.redisClient.on('error', (err) =>
      console.error('Redis Client Error', err),
    );
    this.redisClient.connect();
  }

  async set(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<string | null> {
    return await this.redisClient.set(key, value, { EX: ttlSeconds });
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }
}
