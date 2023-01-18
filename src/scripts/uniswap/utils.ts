import { truncate } from "../../pages/UniswapFee/processing";
import { TransformedPoolEvent, Event } from "./types";

export const transformEvent = (data: Event): TransformedPoolEvent => {
  const decimals = Math.abs(
    parseInt(data.pool.token0.decimals) - parseInt(data.pool.token1.decimals)
  );
  const priceInverse =
    (parseFloat(data.sqrtPriceX96) / 2 ** 96) ** 2 * 10 ** -decimals;
  const price =
    (1 / (parseFloat(data.sqrtPriceX96) / 2 ** 96) ** 2) * 10 ** decimals;

  // console.log(
  //   "transformEvent",
  //   price,
  //   priceInverse,
  //   data.sqrtPriceX96,
  //   data.transaction.blockNumber,
  //   data.transaction.id
  // );
  return {
    raw: data,
    timestamp: parseInt(data.timestamp),
    createdOn: new Date(parseInt(data.timestamp) * 1000).toISOString(),
    /**
     * Old formula: parseFloat(data.amount1) / (parseFloat(data.amount0) * -1)
     * For arbitrum: (2948911363741185401360272/2^96)^2*10^12
     * For ethereum: 1/((2129553765676570172321198961654853/2^96)^2/10^12)
     */
    // TODO: We should pick token decimals
    price: parseFloat(truncate(price, 12)), //priceInverse),
    priceInverse, //: 1 / ((parseInt(data.sqrtPriceX96) / 2 ** 96) ** 2 * 10 ** 12),
  };
};
export const transformEvents = (data: Event[]): TransformedPoolEvent[] => {
  return data.map((event: Event) => transformEvent(event));
};

export const cleanEvent = (data: Event[]): TransformedPoolEvent[] => {
  // group by blockNumber

  const groupedByBlockNumber = data.reduce(
    (acc: { [key: string]: TransformedPoolEvent[] }, event) => {
      // console.log(event.transaction.id);
      acc[event.transaction.blockNumber] = [
        ...(acc[event.transaction.blockNumber] || []),
        transformEvent(event),
      ];
      return acc;
    },
    {}
  );

  // Let's try to compute the mean

  // const events: TransformedPoolEvent[] = [];

  const events = Object.entries(groupedByBlockNumber)
    .map(([blockNumber, events]) => {
      if (events.length > 1) {
        console.log(
          "Skipping event: too many events in block",
          blockNumber,
          events
        );
        return undefined;
      }
      const mean =
        events.reduce((acc, event) => acc + event.price, 0) / events.length;
      return {
        raw: events[0].raw,
        timestamp: events[0].timestamp,
        createdOn: events[0].createdOn,
        price: mean,
      };
    })
    .filter((e) => e !== undefined) as TransformedPoolEvent[];

  console.log("END PROCESSING", groupedByBlockNumber, events);

  return events; //[];
};
