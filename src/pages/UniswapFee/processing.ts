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
  lastProcessedIndex: number; // index of the last element whose price as been considered for the computation of L
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
      console.log("computeMetrics", index);
      // SKIPPING CONDITIONS

      // Missing current event, it has been discard so no way to compute l
      if (!currEvent) {
        console.log("Skipping event: missing current");
        return acc;
      }

      // This event exist, so we can update the lastProcessedIndex
      acc.lastProcessedIndex = index;

      // Current event is present, now we need to run additional check

      // First event, we need the prev to compute delta price (l)
      if (index === 0) {
        // Condition: current event EXIST and is the first event
        console.log(
          `Skipping event: first event | Setting priceBeforeJump at ${currEvent.price}`
        );
        priceBeforeJump = currEvent.price;
        return acc;
      }

      // getting the previous event
      const prevEvent = events[index - 1];

      if (!prevEvent && !priceBeforeJump) {
        // Condition: current event EXIST and prev event DON'T EXIST and priceBeforeJump DON'T EXIST (never done a jump)
        console.log(
          `Skipping event: missing prev event and priceBeforeJump. Setting priceBeforeJump at ${currEvent.price}`
        );
        priceBeforeJump = currEvent.price;
        return acc;
      }

      if (!prevEvent) {
        // Condition: current event EXIST and prev event DON'T EXIST

        // Missing previous event, it has been discard so no way to compute l but using priceBeforeJump
        const deltaPrice = Math.abs(currEvent.price - priceBeforeJump);
        const deltaPriceInverse = Math.abs(
          currEvent.priceInverse - priceBeforeJump
        );
        acc.lSum = acc.lSum + deltaPrice;
        acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;
        priceBeforeJump = currEvent.price;
        acc.lastProcessedIndex = index;
        console.log(
          `Skipping event: missing prev, but adding ${deltaPrice} to lSum`
        );
        return acc;
      }

      // Condition: current event EXIST and prev event EXIST

      const deltaPrice = Math.abs(currEvent.price - prevEvent.price);
      const deltaPriceInverse = Math.abs(
        prevEvent.priceInverse - currEvent.priceInverse
      );

      // const payedFee = (deltaPrice * currEvent.price) / 100;

      acc.lSum = acc.lSum + deltaPrice;
      acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;
      priceBeforeJump = currEvent.price;
      console.log(
        "Computing L",
        new Date(currEvent.createdOn).toISOString(),
        "|",
        acc.lSum,
        deltaPrice,
        currEvent.price,
        prevEvent.price,
        "|",
        currEvent.raw.transaction.blockNumber,
        currEvent.raw.transaction.id
      );
      return acc;
    },
    {
      lSum: 0,
      lSumInverse: 0,
      lastProcessedIndex: 0,
    }
  );
  return {
    lSum: metrics.lSum,
    lSumInverse: metrics.lSumInverse,
    lastProcessedIndex: metrics.lastProcessedIndex,
    data: events as any, //.filter((el) => !!el) as TransformedPoolEvent[],
  };
}
