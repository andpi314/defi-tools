export enum Networks {
  MAINNET = "MAINNET",
  FANTOM = "FANTOM",
}

export const ClientConfig = {
  [Networks.FANTOM]: "https://api.ftmscan.com/api",
  [Networks.MAINNET]: "http://api.etherscan.io/api",
};
