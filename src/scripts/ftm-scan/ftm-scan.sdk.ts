import { ClientConfig, Networks } from "../config";
import { IGetTransactionsResponse } from "./type";
import { ApiClient } from "../api-client/client";
import * as queryString from "query-string";

export enum TModule {
  account = "account",
  contract = "contract",
}

export enum TAction {
  txlist = "txlist",
  getAbi = "getabi",
}

export enum TSort {
  asc = "asc",
  desc = "desc",
}

export class EtherscanScan {
  private readonly apiKey: string;
  private apiClient: ApiClient;
  constructor(apiKey: string, network: Networks) {
    this.apiKey = apiKey;
    this.apiClient = new ApiClient(ClientConfig[network]);
  }

  // ######## SMART CONTRACT ENDPOINT ########

  public async getAbiFromAddress(address: string) {
    const params = {
      module: TModule.contract,
      action: TAction.getAbi,
      address,
      apikey: this.apiKey,
    };

    const url = `?${queryString.stringify(params)}`;

    /**
     *  const contentBlob = await res.blob()
      const abiString = JSON.parse(await contentBlob.text())
      const string = JSON.parse(abiString.result)
     */

    return await this.apiClient.issueGetRequest(url);
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
