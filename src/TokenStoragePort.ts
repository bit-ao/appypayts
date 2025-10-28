import { AccessToken } from "./AccessToken";
export interface TokenStoragePort {
  get(): Promise<AccessToken | null>;
  set(token: AccessToken): Promise<void>;
  clear(): Promise<void>;
}
