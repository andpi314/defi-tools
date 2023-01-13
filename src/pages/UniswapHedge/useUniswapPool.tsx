import axios from "axios";
import { useState } from "react";
import { SupportedNetworks, UniswapGraphV3 } from "../../scripts/uniswap";
import { UniswapPoolTransaction } from "../../scripts/uniswap/types";
import { DateRangeSampler } from "../../utils/date";
import { sleep } from "../../utils/fetch";

export const getSwapsAllPages = async (poolAddress: string) => {
  const baseApi = process.env.REACT_APP_UNISWAP_V3_GRAPH_BASE_API;
  if (!baseApi)
    throw new Error("Missing REACT_APP_UNISWAP_V3_GRAPH_BASE_API env variable");

  const getQuery = (
    first: number,
    skip: number
  ) => `query transactions($address: Bytes!, $timestampMin: BigInt!) {
    swaps(
      first: ${first}
      skip: ${skip}
      orderBy: timestamp
      orderDirection: desc
      where: {pool: $address, timestamp_gt: $timestampMin}
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
      }
      origin
      amountUSD
      amount0
      amount1
      sender
      transaction {
        id
      }
    }
  }`;

  const entitiesPerPage = 1000;
  let skip = 0;
  let hasNextPage = true;
  let data = [];
  do {
    const query = getQuery(1000, skip);

    const response = await axios.post(
      baseApi,
      // !Warning: it only fetches first 100 transactions, but you can change this parameter to met your needs
      {
        operationName: "transactions",
        variables: {
          address: poolAddress,
          timestampMin: 1669852800,
          //first: first || 100 },
        },
        query,
        //  "query transactions($address: Bytes!, $first: Int!) {\n  mints(\n    first: $first\n    orderBy: timestamp\n    orderDirection: desc\n    where: {pool: $address}\n    subgraphError: allow\n  ) {\n    timestamp\n    transaction {\n      id\n      __typename\n    }\n    pool {\n      token0 {\n        id\n        symbol\n        __typename\n      }\n      token1 {\n        id\n        symbol\n        __typename\n      }\n      __typename\n    }\n    owner\n    sender\n    origin\n    amount0\n    amount1\n    amountUSD\n    __typename\n  }\n  swaps(\n    first: $first\n    orderBy: timestamp\n    orderDirection: desc\n    where: {pool: $address}\n    subgraphError: allow\n  ) {\n    timestamp\n    transaction {\n      id\n      __typename\n    }\n    pool {\n      token0 {\n        id\n        symbol\n        __typename\n      }\n      token1 {\n        id\n        symbol\n        __typename\n      }\n      __typename\n    }\n    origin\n    amount0\n    amount1\n    amountUSD\n    __typename\n  }\n  burns(\n    first: $first\n    orderBy: timestamp\n    orderDirection: desc\n    where: {pool: $address}\n    subgraphError: allow\n  ) {\n    timestamp\n    transaction {\n      id\n      __typename\n    }\n    pool {\n      token0 {\n        id\n        symbol\n        __typename\n      }\n      token1 {\n        id\n        symbol\n        __typename\n      }\n      __typename\n    }\n    owner\n    amount0\n    amount1\n    amountUSD\n    __typename\n  }\n}\n",
      }
    );

    if (response.data.data?.swaps?.length < entitiesPerPage) {
      hasNextPage = false;
    }
    skip += entitiesPerPage;
    data.push(...response.data.data.swaps);
    // cool stuff here
    await sleep(50);
  } while (hasNextPage && skip <= 5000);

  return data;
};

export const useUniswapPool = () => {
  const [transactions, setTransactions] = useState<UniswapPoolTransaction>({
    burns: [],
    mints: [],
    swaps: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const fetchPoolTransactions = async (poolAddress: string, first?: number) => {
    try {
      setError(undefined);
      setLoading(true);

      const startDate = new Date(1673517832101 - 1000 * 60 * 60 * 15); //new Date(new Date().getTime() - );

      const ranges = new DateRangeSampler({
        start: startDate,
        end: new Date(1673521432101),
        maxSamples: 30,
      }).getRanges();

      console.log(
        "ranges",
        ranges.map((r) => ({
          start: new Date(r.start).toISOString(),
          end: new Date(r.end).toISOString(),
        }))
      );

      const uniswap = new UniswapGraphV3(SupportedNetworks.ethereum);

      const data = await Promise.all(
        ranges.map(async (range) => {
          const payload = {
            poolAddress,
            timestampGte: parseInt((range.start / 1000).toString()),
            timestampLt: parseInt((range.end / 1000).toString()),
          };
          // console.log(payload);
          const swapsInRange = await uniswap.getSwaps(payload);
          return {
            range,
            data: swapsInRange,
          };
        })
      );

      // Flat the data
      const swaps = data.reduce(
        (acc: any, item: any) => (acc = [...acc, ...item.data]),
        []
      );

      const getRandomArbitrary = (min: any, max: any) => {
        return Math.random() * (max - min) + min;
      };

      const dataWithPool = await Promise.all(
        swaps.map(async (swap) => {
          // console.log("DataWithPool", swap);
          await sleep(getRandomArbitrary(200, 50000));

          const pool = await uniswap.getPool(
            poolAddress,
            //"0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",
            parseInt(swap.transaction.blockNumber)
          );
          // console.log("Pool", pool);

          // await random seconds to avoid rate limit

          return { ...swap, historicalPoolData: pool[0] };
        })
      );

      //  console.log("FETCHING CALL", poolAddress);

      // const latestSwap = await uniswap.getLatestSwaps(poolAddress);

      //  console.log("FETCHING DONE", swaps);

      setTransactions(
        // response.data.data || {
        //   burns: [],
        //   mints: [],
        //   swaps: [],
        // }
        {
          burns: [],
          mints: [],
          swaps: dataWithPool,
        }
      );
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return {
    transactions: {
      fetch: fetchPoolTransactions,
      data: transactions,
      loading,
      error,
    },
  };
};

export const useUniswapPools = () => {
  const baseApi = process.env.REACT_APP_UNISWAP_V3_GRAPH_BASE_API;
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const fetch = async () => {
    try {
      setLoading(true);

      if (!baseApi)
        throw new Error(
          "Missing REACT_APP_UNISWAP_V3_GRAPH_BASE_API env variable"
        );

      const response: any = await axios.post(baseApi, {
        operationName: "pools",
        variables: {},
        query:
          //  'query pools {\n  pools(\n    where: {id_in: ["0x4ff7e1e713e30b0d1fb9cd00477cef399ff9d493", "0x4fabb145d64652a948d72533023f6e7a623c7c53", "0x000ea4a83acefdd62b1b43e9ccc281f442651520", "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248", "0xa80964c5bbd1a0e95777094420555fead1a26c1e", "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", "0x5777d92f208679db4b9778590fa3cab3ac9e2168", "0x6c6bc977e13df9b0de53b251522280bb72383700", "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed", "0x3416cf6c708da44db2624d63ea0aaef7113527c6", "0x4585fe77225b41b697c938b018e2ac67ac5a20c0", "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36", "0xc5af84701f98fa483ece78af83f11b6c38aca71d", "0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52", "0x8ee3cc8e29e72e03c4ab430d7b7e08549f0c71cc", "0x11b815efb8f581194ae79006d24e0d814b7697f6", "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35", "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8", "0x7379e81228514a1d2a6cf7559203998e20598346", "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", "0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8", "0x7bea39867e4169dbe237d55c8242a8f2fcdcc387", "0x00cef0386ed94d738c8f8a74e8bfd0376926d24c", "0x97e7d56a0408570ba1a7852de36350f7713906ec", "0x5c128d25a21f681e678cb050e551a895c9309945", "0xe931b03260b2854e77e8da8378a1bc017b13cb97", "0x64a078926ad9f9e88016c199017aea196e3899e1", "0xb9044f46dcdea7ecebbd918a9659ba8239bd9f37", "0x40e629a26d96baa6d81fae5f97205c2ab2c1ff29", "0x60594a405d53811d3bc4766596efd80fd545a270", "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf", "0x290a6a7460b308ee3f19023d2d00de604bcf5b42", "0x735a26a57a0a0069dfabd41595a970faf5e1ee8b", "0xac4b3dacb91461209ae9d41ec517c2b9cb1b7daf", "0x69d91b94f0aaf8e8a2586909fa77a5c2c89818d5", "0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74", "0xf56d08221b5942c428acc5de8f78489a97fc5599", "0x1c5c60bef00c820274d4938a5e6d04b124d4910b", "0x39529e96c28807655b5856b3d342c6225111770e", "0x840deeef2f115cf50da625f7368c24af6fe74410", "0x4b5ab61593a2401b1075b90c04cbcdd3f87ce011", "0x5764a6f2212d502bc5970f9f129ffcd61e5d7563", "0xe8c6c9227491c0a8156a0106a0204d881bb7e531", "0xf482fce04ef6f29ad56e46fef2de038c42126e2e", "0xc2a856c3aff2110c1171b8f942256d40e980c726", "0x9febc984504356225405e26833608b17719c82ae", "0x04a2004b2032fef2ba93f40b0e34d26ab7b00120", "0x6279653c28f138c8b31b8a0f6f8cd2c58e8c1705", "0x2eb8f5708f238b0a2588f044ade8dea7221639ab", "0x87986ae1e99f99da1f955d16930dc8914ffbed56", "0xc0d19f4fae83eb51b2adb59eb649c7bc2b19b2f6"]}\n    orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ) {\n    id\n    feeTier\n    liquidity\n    sqrtPrice\n    tick\n    token0 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token1 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token0Price\n    token1Price\n    volumeUSD\n    volumeToken0\n    volumeToken1\n    txCount\n    totalValueLockedToken0\n    totalValueLockedToken1\n    totalValueLockedUSD\n    __typename\n  }\n  bundles(where: {id: "1"}) {\n    ethPriceUSD\n    __typename\n  }\n}\n',
          //   'query pools {\n  pools(\n    where: {id_in: ["0x45dda9cb7c25131df268515131f647d726f50608","0xbd934a7778771a7e2d9bf80596002a214d8c9304","0x0e44ceb592acfc5d3f09d996302eb4c499ff8c10"]}\n    orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ) {\n    id\n    feeTier\n    liquidity\n    sqrtPrice\n    tick\n    token0 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token1 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token0Price\n    token1Price\n    volumeUSD\n    volumeToken0\n    volumeToken1\n    txCount\n    totalValueLockedToken0\n    totalValueLockedToken1\n    totalValueLockedUSD\n    __typename\n  }\n  bundles(where: {id: "1"}) {\n    ethPriceUSD\n    __typename\n  }\n}\n',
          'query pools {\n  pools(\n    where: {id_in: ["0x7e5e4a3f855f19cc1a45b9eff1c8b2419036ce85","0x17c14d2c404d167802b16c450d3c99f88f2c4f4d","0xc31e54c7a869b9fcbecc14363cf510d1c41fa443"]}\n    orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ) {\n    id\n    feeTier\n    liquidity\n    sqrtPrice\n    tick\n    token0 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token1 {\n      id\n      symbol\n      name\n      decimals\n      derivedETH\n      __typename\n    }\n    token0Price\n    token1Price\n    volumeUSD\n    volumeToken0\n    volumeToken1\n    txCount\n    totalValueLockedToken0\n    totalValueLockedToken1\n    totalValueLockedUSD\n    __typename\n  }\n  bundles(where: {id: "1"}) {\n    ethPriceUSD\n    __typename\n  }\n}\n',
      });

      if (response.status !== 200) {
        console.error(response);
        throw new Error("Error fetching transactions");
      }

      //   console.log("pools", response);
      setData(response.data?.data?.pools || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return {
    fetch,
    data,
    loading,
    error,
  };
};
