import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import type { TokenStoragePort } from "../TokenStoragePort";
import { AccessToken } from "../AccessToken";

export class DiskTokenStorage implements TokenStoragePort {
  private path: string;

  constructor(path: string = resolve(process.cwd(), "temp", "oauth_token.json")) {
    this.path = path;
    const dir = dirname(this.path);
    fs.mkdir(dir, { recursive: true }).catch(() => {});
  }

  async get(): Promise<AccessToken | null> {
    try {
      const raw = await fs.readFile(this.path, "utf-8");
      const data = JSON.parse(raw);
      return AccessToken.fromResponse(data);
    } catch {
      return null;
    }
  }

  async set(token: AccessToken): Promise<void> {
    const payload = {
      token_type: token.tokenType,
      access_token: token.accessToken,
      expires_on: token.expiresOn,
      resource: token.resource,
    };

    await fs.writeFile(this.path, JSON.stringify(payload), { mode: 0o600 });
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.path);
    } catch {
      // ignore se não existir
    }
  }
}
