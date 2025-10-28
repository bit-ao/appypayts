export class OAuthCredentials {
    clientId;
    clientSecret;
    resource;
    constructor(clientId, clientSecret, resource) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.resource = resource;
    }
}
