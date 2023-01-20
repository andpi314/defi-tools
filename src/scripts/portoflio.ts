import { ethers } from "ethers";
import { Networks } from "./config";
import { EtherscanScan } from "./ftm-scan/ftm-scan.sdk";

type StandardConfig = {
  noCache: boolean;
};

export class Portfolio {
  public readonly address: string;
  private readonly client: EtherscanScan;
  private readonly depositedAmountCache: number | undefined;
  constructor(address: string) {
    if (!process.env.REACT_APP_ETHERSCAN_API_KEY)
      throw new Error("Can not find FTMSCAN_API_KEY in environment variables");
    this.address = address;
    this.client = new EtherscanScan(
      process.env.REACT_APP_ETHERSCAN_API_KEY,
      Networks.MAINNET
    );
  }

  public async getDepositedAmount(config?: StandardConfig): Promise<number> {
    if (this.depositedAmountCache && !config?.noCache)
      return this.depositedAmountCache;
    const transactions = await this.client.getTransactions(this.address);

    const deposits = transactions.result.filter((t) => t.to === this.address);

    const inBoundBalance = ethers.utils
      .formatEther(
        deposits.reduce((acc, t) => acc.add(t.value), ethers.BigNumber.from(0))
      )
      .toString();
    return parseFloat(inBoundBalance);
  }
}
