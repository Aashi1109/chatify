import { createClient } from "@redis/client";
import logger from "@logger";
import { jnparse, jnstringify } from "@lib/utils";

class RedisMethods {
  protected client: ReturnType<typeof createClient>;
  protected nsp: string;

  constructor(client: ReturnType<typeof createClient>, nsp: string) {
    this.client = client;
    this.nsp = nsp;
  }

  async setString(key: string, value: string, ttl?: number) {
    value = jnstringify(value);

    return Boolean(
      await this.client.set(`${this.nsp}:${key}`, value, { EX: ttl })
    );
  }

  async setObject(key: string, value: any) {
    return Boolean(
      await this.client.set(`${this.nsp}:${key}`, jnstringify(value))
    );
  }

  async setList(key: string, value: any, ttl?: number) {
    const key_name = `${this.nsp}:${key}`;
    try {
      const pipeline = this.client.multi();
      pipeline.rPush(key_name, jnstringify(value));
      if (ttl) pipeline.expire(key_name, ttl);
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Redis setList error: ${error}`);
      return false;
    }
  }

  async setListBulk(key: string, values: any[]) {
    try {
      if (values.length > 0) {
        const fullKey = `${this.nsp}:${key}`;
        const pipeline = this.client.multi();
        pipeline.del(fullKey);
        values.forEach((value) => {
          pipeline.rPush(fullKey, jnstringify(value));
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

  async hSet(key: string, path: string, value: any, ttl?: number) {
    try {
      value = jnstringify(value);
      const pipeline = this.client.multi();
      pipeline.hSet(`${this.nsp}:${key}`, path, value);
      if (ttl) pipeline.expire(`${this.nsp}:${key}`, ttl);
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Redis hset error: ${error}`);
      return false;
    }
  }

  async hGet(key: string, path?: string) {
    if (path) {
      const value = await this.client.hGet(`${this.nsp}:${key}`, path);
      return value ? jnparse(value) : null;
    }
    // Get all hash fields and values if no path is specified
    const allValues = await this.client.hGetAll(`${this.nsp}:${key}`);
    return Object.keys(allValues).length > 0
      ? Object.fromEntries(
          Object.entries(allValues).map(([k, v]) => [k, jnparse(v)])
        )
      : null;
  }

  async getList(key: string) {
    try {
      return await this.client.lRange(`${this.nsp}:${key}`, 0, -1);
    } catch (error) {
      logger.error(`Redis getList error: ${error}`);
      return [];
    }
  }

  async getAllKeys({ pattern = "*" }: { pattern?: string } = {}) {
    return await this.client.keys(`${this.nsp}:${pattern}`);
  }

  async deleteKey(key: string) {
    return Boolean(await this.client.del(`${this.nsp}:${key}`));
  }

  async deleteAllKeys() {
    return Boolean(await this.client.del(`${this.nsp}:*`));
  }

  async getBufferSize(key: string): Promise<number> {
    return await this.client.lLen(`${this.nsp}:${key}`);
  }

  async getKey(key: string): Promise<any> {
    try {
      const value = await this.client.get(`${this.nsp}:${key}`);
      return value ? jnparse(value) : null;
    } catch (error) {
      logger.error(`Redis getKey error: ${error}`);
      return null;
    }
  }

  async getAllListItems<T = any>(
    options: {
      pattern?: string;
      parser?: (item: string) => T;
      batchSize?: number;
    } = {}
  ) {
    const { pattern = "*", parser = jnparse, batchSize = 1000 } = options;

    try {
      const keys = await this.getAllKeys({ pattern });
      if (!keys.length) return [];

      const pipeline = this.client.multi();

      // Queue all LRANGE commands
      keys.forEach((key) => {
        const keyName = key.split(":")?.pop();
        pipeline.lRange(`${this.nsp}:${keyName}`, 0, -1);
      });

      const results = await pipeline.exec();
      const items: T[] = [];

      // Process in batches
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        const parsedBatch = batch.flatMap((result) => {
          if (!result || result[0]) {
            logger.error(`Error processing list: ${result?.[0]}`);
            return [];
          }
          return (result as string[]).map((item) => parser(item));
        });

        items.push(...parsedBatch);
      }

      return items;
    } catch (error) {
      logger.error(`Error getting list items: ${error}`);
      return [];
    }
  }
}

export default RedisMethods;
