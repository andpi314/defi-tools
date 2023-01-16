import axios from "axios";
import { Event } from "./types";
export interface GetSwapProps {
  poolAddress: string;
  first?: number;
  skip?: number;
  timestampGte: number;
  timestampLt: number;
}

export enum SupportedNetworks {
  ethereum = "ethereum",
  polygon = "polygon",
  arbitrum = "arbitrum",
  optimism = "optimism",
}

export interface GetPoolsPool {
  id: string;
  feeTier: string;
  volumeUSD: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
}

export class UniswapGraphV3 {
  private endpoint: string;
  private readonly ENDPOINTS: {
    [SupportedNetworks.arbitrum]: string;
    [SupportedNetworks.polygon]: string;
    [SupportedNetworks.ethereum]: string;
    [SupportedNetworks.optimism]: string;
  } = {
    ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    polygon:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
    arbitrum:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one",
    optimism:
      "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  };

  constructor(network: SupportedNetworks) {
    this.endpoint = this.ENDPOINTS[network];
  }

  private async fetch(query: string, payload: any) {
    return await axios.post(this.endpoint, {
      query,
      ...payload,
    });
  }

  public async getSwapInPosition(poolAddress: string) {
    const start = parseInt((1673273753000 / 1000).toString());
    const end = parseInt((1673279569086 / 1000).toString());
    const query = `
    query transactions($address: Bytes!, $first: Int!) {
      swaps(
        first: $first
        orderBy: timestamp
        orderDirection: desc
        where: {pool: $address, timestamp_gte: ${start}, timestamp_lt: ${end}}
        subgraphError: allow
      ) {
        timestamp
        pool {
          token0 {
            id
            symbol
            decimals
          }
          token1 {
            id
            symbol
            decimals
          }
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
        }
        origin
        amountUSD
        amount0
        amount1
        sender
        id
        transaction {
          id
          blockNumber
        }
      }
    }
    `;

    const response = await this.fetch(query, {
      operationName: "transactions",
      variables: {
        address: poolAddress,
        first: 1000,
      },
    });

    return response.data.data?.swaps;
  }

  public async getLatestSwaps(poolAddress: string) {
    const query = `
    query transactions($address: Bytes!, $first: Int!) {
      swaps(
        first: $first
        orderBy: timestamp
        orderDirection: desc
        where: {pool: $address}
        subgraphError: allow
      ) {
        timestamp
        pool {
          token0 {
            id
            symbol
            decimals
          }
          feeTier
          token1 {
            id
            symbol
            decimals
          }
        }
        origin
        amountUSD
        amount0
        amount1
        sender 
        id
        transaction {
          id
          blockNumber
        }
      }
    }
    `;

    const response = await this.fetch(query, {
      operationName: "transactions",
      variables: {
        address: poolAddress,
        first: 1000,
      },
    });

    return response.data.data?.swaps;
  }

  public async getSwaps({
    poolAddress,
    timestampGte,
    timestampLt,
    first,
    skip,
  }: GetSwapProps): Promise<any[]> {
    const query = `
    query transactions($address: Bytes!, $timestampGte: BigInt!, $timestampLt: BigInt!, $first: Int!, $skip: Int!) {
    swaps(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: {pool: $address, timestamp_gte: $timestampGte, timestamp_lt: $timestampLt }
      subgraphError: allow
    ) {
      timestamp
      pool {
        feeTier
        sqrtPrice
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
      }
      id
      sqrtPriceX96
      origin
      amountUSD
      amount0
      amount1
      sender
      transaction {
        id
        blockNumber
      }
    }
  }`;

    const response = await this.fetch(query, {
      operationName: "transactions",
      variables: {
        address: poolAddress,
        timestampGte,
        timestampLt,
        first: first || 1000,
        skip: skip || 0,
      },
    });

    return response.data.data?.swaps;
  }

  public async getPool(poolAddress: string, blockNumber: number) {
    const query = `
    query pool($address: Bytes!, $blockNumber: Int!){
      pool(block: {number: $blockNumber }, id: $address){
        sqrtPrice
    }
    `;
    const response = await this.fetch(query, {
      operationName: "pool",
      variables: {
        address: poolAddress,
        blockNumber,
      },
    });
    return response.data.data?.pool;
  }

  public async getPools() {
    const query = `
    query pools{
      pools (first: 1000 orderBy: volumeUSD orderDirection: desc){
              id
              feeTier
              volumeUSD
              token0 {
                id
                symbol
                name
                decimals
              }
              token1 {
                id
                symbol
                name
                decimals
              }
          }
  }`;

    const response = await this.fetch(query, {
      operationName: "pools",
    });
    return response.data.data?.pools as GetPoolsPool[];
  }
}
