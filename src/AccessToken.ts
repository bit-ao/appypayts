export class AccessToken {
  public tokenType: string;
  public accessToken: string;
  public expiresOn: number; // timestamp (segundos)
  public resource?: string;
  constructor(tokenType: string, accessToken: string, expiresOn: number, resource: string) {
    this.tokenType = tokenType;
    this.accessToken = accessToken;
    this.expiresOn = expiresOn;
    this.resource = resource;
  }
  static fromResponse(data: any): AccessToken {
    return new AccessToken(
        data.token_type,
        data.access_token,
        Number(data.expires_on || Math.floor(Date.now() / 1000) + data.expires_in),
        data.resource
    );
  }

  isExpired(): boolean {
    return Math.floor(Date.now() / 1000) >= this.expiresOn;
  }
}
