import { createClient } from "@redis/client";
import logger from "@logger";

class RedisMethods {
  protected client: ReturnType<typeof createClient>;
  protected nsp: string;

  constructor(client: ReturnType<typeof createClient>, nsp: string) {
    this.client = client;
    this.nsp = nsp;
  }

  async setString(key: string, value: string, ttl?: number) {
    return Boolean(
      await this.client.set(`${this.nsp}:${key}`, value, { EX: ttl })
    );
  }

  async setObject(key: string, value: any) {
    return Boolean(
      await this.client.set(`${this.nsp}:${key}`, JSON.stringify(value))
    );
  }

  async setHash(key: string, value: any, ttl?: number) {
    try {
      const pipeline = this.client.multi();
      pipeline.hSet(`${this.nsp}:${key}`, value);
      if (ttl) pipeline.expire(`${this.nsp}:${key}`, ttl);
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Redis setHash error: ${error}`);
      return false;
    }
  }

  async setList(key: string, value: any, ttl?: number) {
    const key_name = `${this.nsp}:${key}`;
    try {
      const pipeline = this.client.multi();
      pipeline.rPush(key_name, value);
      if (ttl) pipeline.expire(key_name, ttl);
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Redis setList error: ${error}`);
      return false;
    }
  }

  async setListBulk(key: string, values: string[]) {
    try {
      if (values.length > 0) {
        const pipeline = this.client.multi();
        values.forEach((value) => {
          pipeline.rPush(`${this.nsp}:${key}`, value);
        });
        await pipeline.exec();
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Redis setListBulk error: ${error}`);
      return false;
    }
  }

  async hSet(key: string, value: any, ttl?: number) {
    try {
      const pipeline = this.client.multi();
      pipeline.hSet(`${this.nsp}:${key}`, value);
      if (ttl) pipeline.expire(`${this.nsp}:${key}`, ttl);
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Redis hset error: ${error}`);
      return false;
    }
  }

  async getList(key: string) {
    try {
      return await this.client.lRange(`${this.nsp}:${key}`, 0, -1);
    } catch (error) {
      logger.error(`Redis getList error: ${error}`);
      return [];
    }
  }

  async getAllKeys() {
    return await this.client.keys(`${this.nsp}:*`);
  }

  async deleteKey(key: string) {
    return Boolean(await this.client.del(`${this.nsp}:${key}`));
  }

  async getBufferSize(key: string): Promise<number> {
    return await this.client.lLen(`${this.nsp}:${key}`);
  }

  async getKey(key: string): Promise<any> {
    return await this.client.get(`${this.nsp}:${key}`);
  }
}

export default RedisMethods;
