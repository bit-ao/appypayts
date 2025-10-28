export class MemoryTokenStorage {
    token = null;
    async get() {
        return this.token;
    }
    async set(token) {
        this.token = token;
    }
    async clear() {
        this.token = null;
    }
}
