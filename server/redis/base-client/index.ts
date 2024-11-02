import config from "@config";
import { jnstringify } from "@lib/utils";
import logger from "@logger";
import { createClient } from "@redis/client";

class BaseRedisClient {
  protected client: ReturnType<typeof createClient>;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.client = createClient({
      socket: {
        reconnectStrategy: this.reconnectStrategy.bind(this),
        host: config.redis.host,
        port: +config.redis.port,
      },
      commandsQueueMaxLength: 1000,
      readonly: false,
      legacyMode: false,
    });

    this.attachErrorListener();
    this.connectionPromise = this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      logger.info("Redis client connected");
    } catch (err) {
      logger.error(`Redis client connection error: ${jnstringify(err)}`);
      throw err;
    }
  }

  private reconnectStrategy(retries: number) {
    const maxRetries = 3;
    const baseDelay = 500;

    if (retries > maxRetries) {
      logger.error(
        "Too many attempts to reconnect. Redis connection was terminated"
      );
      return new Error("Too many retries.");
    }

    // Exponential backoff
    return Math.min(baseDelay * Math.pow(2, retries), 5000);
  }

  // Method to ensure connection before operations
  protected async ensureConnection() {
    if (!this.connectionPromise) {
      this.connectionPromise = this.connect();
    }
    await this.connectionPromise;
  }

  protected attachErrorListener() {
    this.client.on("error", (err) => {
      logger.error(`Redis client error: ${jnstringify(err)}`);
    });
  }
}

export default BaseRedisClient;
