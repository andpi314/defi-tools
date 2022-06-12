// import { IAuthProvider } from "./types";
import * as axios from "axios";

export class ApiClient {
  private axiosInstance: axios.AxiosInstance;
  constructor(
    // private authProvider: IAuthProvider,
    private apiBaseUrl: string,
    private options?: {
      timeoutInMs?: number;
      httpAgent?: any;
      proxy?: false | axios.AxiosProxyConfig;
    }
  ) {
    this.axiosInstance = axios.default.create({
      httpsAgent: this.options?.httpAgent,
      proxy: this.options?.proxy,
      baseURL: this.apiBaseUrl,
    });
  }

  public async issueGetRequest(path: string, pageMode = false) {
    // const partnerToken = this.authProvider.getPartnerToken();
    // const apiKey = this.authProvider.getApiKey();

    const res = await this.axiosInstance.get(path, {
      headers: {
        // "token": partnerToken,
      },
      timeout: this.options?.timeoutInMs,
    });

    return res.data;
  }

  public async issuePostRequest(path: string, body: any) {
    const headers: any = {
      //   "token": this.authProvider.getPartnerToken(),
    };

    const res = await this.axiosInstance.post(path, body, {
      headers,
      timeout: this.options?.timeoutInMs,
    });

    return res.data;
  }

  public async issuePutRequest(path: string, body: any) {
    const res = await this.axiosInstance.put(path, body, {
      headers: {
        // token: this.authProvider.getPartnerToken(),
      },
      timeout: this.options?.timeoutInMs,
    });

    return res.data;
  }

  public async issueDeleteRequest(path: string) {
    const res = await this.axiosInstance.delete(path, {
      headers: {
        // "token": this.authProvider.getPartnerToken(),
      },
      timeout: this.options?.timeoutInMs,
    });

    return res.data;
  }
}
