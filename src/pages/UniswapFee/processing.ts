import { TransformedPoolEvent, Event } from "../../scripts/uniswap/types";
import { transformEvent } from "../../scripts/uniswap/utils";

export type Grouped<T> = { [key: string]: T[] };

export function groupByBlockNumber(
  data: Event[]
): Grouped<TransformedPoolEvent> {
  return data.reduce((acc: Grouped<TransformedPoolEvent>, event) => {
    acc[event.transaction.blockNumber] = [
      ...(acc[event.transaction.blockNumber] || []),
      transformEvent(event),
    ];
    return acc;
  }, {});
}

/**
 * Discard records if there are many in the group
 */
export function discardManyInGroup<T>(input: Grouped<T>): (T | undefined)[] {
  return Object.values(input).map((groupElements) => {
    if (groupElements.length > 1) return undefined;
    return groupElements[0];
  });
}

export interface Metrics {
  lSum: number;
  lSumInverse: number;
}

export interface EventMetrics extends Metrics {
  data: TransformedPoolEvent[];
}

export function computeMetrics(
  events: (TransformedPoolEvent | undefined)[]
): EventMetrics {
  const metrics = events.reduce(
    (
      acc: Metrics,
      currEvent: TransformedPoolEvent | undefined,
      index: number
    ) => {
      // SKIPPING CONDITIONS
      // First event, we need the prev to compute delta price (l)
      if (index === 0) return acc;

      // Missing current event, it has been discard so no way to compute l
      if (!currEvent) {
        console.log("Skipping event: missing current");
        return acc;
      }

      // getting the previous event
      const prevEvent = events[index - 1];

      if (!prevEvent) {
        // Missing previous event, it has been discard so no way to compute l
        console.log("Skipping event: missing in prev");
        return acc;
      }

      const deltaPrice = Math.abs(currEvent.price - prevEvent.price);
      const deltaPriceInverse = Math.abs(
        prevEvent.priceInverse - currEvent.priceInverse
      );

      console.log(
        "Computing L",
        new Date(currEvent.createdOn).toISOString(),
        currEvent.raw.transaction.blockNumber,
        deltaPrice,
        currEvent.price,
        prevEvent.price,
        currEvent.raw.transaction.id
      );

      // const payedFee = (deltaPrice * currEvent.price) / 100;

      acc.lSum = acc.lSum + deltaPrice;
      acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;

      return acc;
    },
    {
      lSum: 0,
      lSumInverse: 0,
    }
  );
  return {
    lSum: metrics.lSum,
    lSumInverse: metrics.lSumInverse,
    data: events.filter((el) => !!el) as TransformedPoolEvent[],
  };
}
