import axios from "axios";

export interface GetSwapProps {
  poolAddress: string;
  first?: number;
  timestampGte: number;
  timestampLt: number;
}

export enum SupportedNetworks {
  ethereum = "ethereum",
  polygon = "polygon",
  arbitrum = "arbitrum",
}

export class UniswapGraphV3 {
  private endpoint: string;
  private readonly ENDPOINTS: {
    [SupportedNetworks.arbitrum]: string;
    [SupportedNetworks.polygon]: string;
    [SupportedNetworks.ethereum]: string;
  } = {
    ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    polygon:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
    arbitrum:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-arbitrum",
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
          }
          token1 {
            id
            symbol
          }
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
        }
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
          }
          feeTier
          token1 {
            id
            symbol
          }
        }
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
  }: GetSwapProps) {
    const query = `
    query transactions($address: Bytes!, $timestampGte: BigInt!, $timestampLt: BigInt!, $first: Int!) {
    swaps(
      first: $first
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
        }
        token1 {
          id
          symbol
        }
      }
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
      },
    });

    return response.data.data?.swaps;
  }

  public async getPool(poolAddress: string, blockNumber: number) {
    const query = `
      query pools($address: Bytes!, $blockNumber: Int!){
        pools (
          where: {id:$address}
          block:{number:$blockNumber}){
                sqrtPrice
            }
      }`;

    const response = await this.fetch(query, {
      operationName: "pools",
      variables: {
        address: poolAddress,
        blockNumber,
      },
    });
    return response.data.data?.pools;
  }
}
