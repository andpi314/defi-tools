import { ClientConfig, Networks } from "../config";
import { IGetTransactionsResponse } from "./type";
import { ApiClient } from "../api-client/client";
import * as queryString from "query-string";

export enum TModule {
  account = "account",
}

export enum TAction {
  txlist = "txlist",
}

export enum TSort {
  asc = "asc",
  desc = "desc",
}

export class FtmScan {
  private readonly apiKey: string;
  private apiClient: ApiClient;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiClient = new ApiClient(ClientConfig[Networks.MAINNET]);
  }

  // ######## ACCOUNT ENDPOINT ########

  public async getTransactions(
    address: string
  ): Promise<IGetTransactionsResponse> {
    const params = {
      module: TModule.account,
      action: TAction.txlist,
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      apikey: this.apiKey,
      //   &offset=10
      sort: TSort.asc,
    };

    const url = `?${queryString.stringify(params)}`;

    return await this.apiClient.issueGetRequest(url);
  }
}
