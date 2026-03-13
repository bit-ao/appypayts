import type { TokenStoragePort } from "../TokenStoragePort";
import { AccessToken } from "../AccessToken";

export class RedisTokenStorage implements TokenStoragePort {
  private token: AccessToken | null = null;

  async get(): Promise<AccessToken | null> {
    return this.token;
  }

  async set(token: AccessToken): Promise<void> {
    this.token = token;
  }

  async clear(): Promise<void> {
    this.token = null;
  }
}
