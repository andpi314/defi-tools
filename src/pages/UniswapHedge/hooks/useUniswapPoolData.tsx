import { useState } from "react";
import {
  GetSwapProps,
  SupportedNetworks,
  UniswapGraphV3,
} from "../../../scripts/uniswap";
import { createRanges } from "../../../utils/date";
import { sleep } from "../../../utils/fetch";

export const getRandomArbitrary = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const useUniswapPoolData = () => {
  const [loading, setLoading] = useState(false);
  const [swaps, setSwaps] = useState<any>([]);

  const getSwaps = async (
    poolAddress: string,
    params: { startDate: string; endDate: string; samples: number },
    network: SupportedNetworks
  ) => {
    try {
      setLoading(true);
      const ranges = createRanges({
        start: new Date(params.startDate),
        end: new Date(params.endDate),
        count: params.samples || 10,
      });
      // console.log(poolAddress, params, ranges);

      const uniswap = new UniswapGraphV3(network);

      const data = await Promise.all(
        ranges.map(async (range) => {
          const data = [];

          const payload: GetSwapProps = {
            poolAddress,
            timestampGte: parseInt((range.start / 1000).toString()),
            timestampLt: parseInt((range.end / 1000).toString()),
          };
          // console.log(payload);

          let skip = 0;
          let hasNextPage = true;
          const entitiesPerPage = 1000;
          do {
            const swapsInRange = await uniswap.getSwaps(payload);

            if (swapsInRange.length < entitiesPerPage) {
              hasNextPage = false;
            }
            skip += entitiesPerPage;
            data.push(...swapsInRange);
            // cool stuff here
            await sleep(150);
            console.warn(
              `Fetching swaps for ${poolAddress} and range ${range.start} - ${range.end} | ${skip} / 5000`
            );
          } while (hasNextPage && skip <= 5000);

          if (skip >= 5000) {
            console.warn(
              `Reached max limit of 5000 swaps for ${poolAddress} and range ${range.start} - ${range.end}`
            );
          }
          return {
            range,
            data: data,
          };
        })
      );

      // Flat the data
      const swaps = data
        .reduce((acc: any, item: any) => (acc = [...acc, ...item.data]), [])
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

      setSwaps(swaps);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return {
    swaps: swaps || [],
    error: undefined,
    loading,
    getSwaps,
  };
};
