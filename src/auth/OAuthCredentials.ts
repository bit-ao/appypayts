export class OAuthCredentials {
  public clientId: string;
  public clientSecret: string;
  public resource: string;
  constructor(clientId: string, clientSecret: string, resource: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.resource = resource;
  }
}
