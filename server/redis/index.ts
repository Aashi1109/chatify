import { jnparse } from "@lib/utils";
import BaseRedisClient from "./base-client";
import RedisMethods from "./methods";
import logger from "@logger";

export class RedisMessageCache extends BaseRedisClient {
  methods: RedisMethods;
  constructor(nsp: string) {
    super();
    this.methods = new RedisMethods(this.getClient(), nsp);
  }

  async getAllMessages() {
    try {
      const keys = await this.methods.getAllKeys();

      // Use Promise.all instead of allSettled for better performance
      const messages = await Promise.all(
        keys.map(async (key) => {
          const keyName = key.split(":")?.pop();
          const msgs = await this.methods.getList(keyName);
          return msgs.map((msg: string) => jnparse(msg));
        })
      );

      return messages.flat();
    } catch (error) {
      logger.error(`Error getting all messages: ${error}`);
      return [];
    }
  }
}

export class RedisCommonCache extends BaseRedisClient {
  methods: RedisMethods;
  constructor(nsp = "common") {
    super();
    this.methods = new RedisMethods(this.getClient(), nsp);
  }

  async storeUserUpdate(userId: string, data: any) {
    return await this.methods.setString(`user:${userId}`, data, 60 * 5);
  }

  async getUserUpdate(userId: string) {
    return await this.methods.getKey(`user:${userId}`);
  }

  async getAllUsers() {
    return await this.methods.getAllKeys();
  }
}
