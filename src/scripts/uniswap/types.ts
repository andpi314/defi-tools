export interface TransformedPoolEvent {
  raw: Event;
  timestamp: number;
  createdOn: string;
  price: number;
  priceInverse: number;
}

export interface Pool {
  token0: {
    id: string;
    symbol: string;
    decimals: string;
  };
  token1: {
    id: string;
    symbol: string;
    decimals: string;
  };
  sqrtPrice: string;
  feeTier: string;
}

export interface HistoricalPoolData {
  sqrtPrice: string;
}

export interface Transaction {
  id: string;
  blockNumber: string;
}
export interface Event {
  amount0: string;
  amount1: string;
  amountUSD: string;
  sqrtPriceX96: string;
  owner: string;
  pool: Pool;
  timestamp: string;
  transaction: Transaction;
  historicalPoolData: HistoricalPoolData;
}

export interface UniswapPoolTransaction {
  burns: Event[];
  mints: Event[];
  swaps: Event[];
}
