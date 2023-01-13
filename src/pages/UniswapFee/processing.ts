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
  return Object.entries(input || {}).map(([blockNumber, groupElements]) => {
    if (groupElements.length > 1) {
      console.log("discardManyInGroup", blockNumber, groupElements);
      return undefined;
    }
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
  let priceBeforeJump = 0;

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

        const deltaPrice = Math.abs(currEvent.price - priceBeforeJump);
        const deltaPriceInverse = Math.abs(
          currEvent.priceInverse - priceBeforeJump
        );
        acc.lSum = acc.lSum + deltaPrice;
        acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;
        priceBeforeJump = currEvent.price;
        console.log(
          `Skipping event: missing prev, but adding ${deltaPrice} to lSum`
        );
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
      priceBeforeJump = currEvent.price;
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
