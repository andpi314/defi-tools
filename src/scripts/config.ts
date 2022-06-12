enum AvailableNetworks {
  FTM = "FTM",
}

interface ClientConfig {}

export enum Networks {
  MAINNET = "MAINNET",
}

export const ClientConfig = {
  [Networks.MAINNET]: "https://api.ftmscan.com/api",
};
