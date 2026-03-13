import axios from "axios";
import { OAuthCredentials } from "./OAuthCredentials";
import type { TokenStoragePort } from "../TokenStoragePort";
import { AccessToken } from "../AccessToken";

export class OAuthClientCredentialsProvider {
  private readonly tokenUrl: string;
  private creds: OAuthCredentials;
  private store: TokenStoragePort;

  constructor(tokenUrl: string, creds: OAuthCredentials, store: TokenStoragePort) {
    this.tokenUrl = tokenUrl;
    this.creds = creds;
    this.store = store;
  }

  async getToken(): Promise<AccessToken> {
    const cached = await this.store.get();
    if (cached && !cached.isExpired()) {
      return cached;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", this.creds.clientId);
    params.append("client_secret", this.creds.clientSecret);
    params.append("resource", this.creds.resource);

    const response = await axios.post(this.tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.status != 200)   throw new Error("BAD AUTENTICATION");
    const token = AccessToken.fromResponse(response.data);
    await this.store.set(token);
    return token;
  }

  async forceRefresh(): Promise<AccessToken> {
    await this.store.clear();
    return this.getToken();
  }
}
