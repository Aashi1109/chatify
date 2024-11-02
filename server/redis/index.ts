import { jnparse } from "@lib/utils";
import BaseRedisClient from "./base-client";
import RedisMethods from "./methods";
import logger from "@logger";

class RedisMessageCache extends BaseRedisClient {
  methods: RedisMethods;
  constructor() {
    super();
    this.methods = new RedisMethods(this.client, "conversations");
  }

  async getAllMessages() {
    try {
      const keys = await this.methods.getAllKeys();

      // Use Promise.all instead of allSettled for better performance
      const messages = await Promise.all(
        keys.map(async (key) => {
          const keyName = key.split(":")[1];
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

export default RedisMessageCache;
