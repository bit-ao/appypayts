import axios from "axios";
import type { AxiosRequestConfig } from "axios";
type AxiosRequestHeaders = AxiosRequestConfig["headers"];
type Method = AxiosRequestConfig["method"];
export class HttpClient {
  constructor(private baseUrl: string) {}
  async request<T = any>(
    method: Method,
    path: string,
    headers: AxiosRequestHeaders ,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;
    const { data } = await axios.request<T>({
      url,
      method,
      headers,
      data: body,
    });
    return data;
  }
}
