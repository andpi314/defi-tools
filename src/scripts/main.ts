import { ethers } from "ethers";
import { FtmScan } from "./ftm-scan/ftm-scan.sdk";
import { Portfolio } from "./portoflio";

import * as dotenv from "dotenv";

dotenv.config();

async function MainWorkbench() {
  const address = (process.env.WALLET_ADDRESS || "").toLowerCase();
  const portfolio = new Portfolio(address);

  const inBoundBalance = await portfolio.getDepositedAmount();

  console.log(2186.31 - inBoundBalance);
}

MainWorkbench();
