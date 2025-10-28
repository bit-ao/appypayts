import axios from "axios";
export class HttpClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(method, path, headers, body) {
        const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;
        const { data } = await axios.request({
            url,
            method,
            headers,
            data: body,
        });
        return data;
    }
}
