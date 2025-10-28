export class AccessToken {
    tokenType;
    accessToken;
    expiresOn; // timestamp (segundos)
    resource;
    constructor(tokenType, accessToken, expiresOn, resource) {
        this.tokenType = tokenType;
        this.accessToken = accessToken;
        this.expiresOn = expiresOn;
        this.resource = resource;
    }
    static fromResponse(data) {
        return new AccessToken(data.token_type, data.access_token, Number(data.expires_on || Math.floor(Date.now() / 1000) + data.expires_in), data.resource);
    }
    isExpired() {
        return Math.floor(Date.now() / 1000) >= this.expiresOn;
    }
}
