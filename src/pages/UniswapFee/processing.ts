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

export function truncate(input: number, decimals: number) {
  const [integerPart, decimalPart] = `${input}`.split(".");
  return `${integerPart}.${decimalPart.slice(0, decimals)}`;
}

export interface Metrics {
  lSum: number;
  lSumInverse: number;
  sqrtDelta: number;
  sqrtDeltaInverse: number;
  sqrtDeltaPriceInverse: number;
  sqrtDeltaInversePriceInverse: number;
  F: number; // √l * feeTier
  inverseF: number; // 1/√l * feeTier
  FPriceInverse: number;
  inverseFPriceInverse: number;
  lastProcessedIndex: number; // index of the last element whose price as been considered for the computation of L
  lCumValues: ({ value: number; label: string } | undefined)[];
}

export interface EventMetrics extends Metrics {
  data: TransformedPoolEvent[];
}

export function computeMetrics(
  events: (TransformedPoolEvent | undefined)[]
): EventMetrics {
  let priceBeforeJump = 0;
  let inverseBeforeJump = 0;

  const metrics = events.reduce(
    (
      acc: Metrics,
      currEvent: TransformedPoolEvent | undefined,
      index: number
    ) => {
      // SKIPPING CONDITIONS

      // Missing current event, it has been discard so no way to compute l
      if (!currEvent) {
        console.log("Skipping event: missing current");
        acc.lCumValues = [...acc.lCumValues, undefined];
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
        inverseBeforeJump = currEvent.priceInverse;
        acc.lCumValues = [...acc.lCumValues, undefined];
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
        inverseBeforeJump = currEvent.priceInverse;
        acc.lCumValues = [...acc.lCumValues, undefined];
        return acc;
      }

      if (!prevEvent) {
        // Condition: current event EXIST and prev event DON'T EXIST

        // Missing previous event, it has been discard so no way to compute l but using priceBeforeJump

        acc.lastProcessedIndex = index;
        acc.lCumValues = [
          ...acc.lCumValues,
          { value: acc.lSum, label: currEvent.createdOn },
        ];

        // ####### PRICE #######

        const sqrtDelta = Math.abs(
          Math.sqrt(currEvent.price) - Math.sqrt(priceBeforeJump)
        );
        const sqrtDeltaInverse = Math.abs(
          1 / Math.sqrt(currEvent.price) - 1 / Math.sqrt(priceBeforeJump)
        );
        const deltaPrice = Math.abs(currEvent.price - priceBeforeJump);
        acc.lSum = acc.lSum + deltaPrice;
        priceBeforeJump = currEvent.price;
        acc.sqrtDelta = acc.sqrtDelta + sqrtDelta;
        acc.sqrtDeltaInverse = acc.sqrtDeltaInverse + sqrtDeltaInverse;

        // ####### PRICE INVERSE #######
        const sqrtDeltaPriceInverse = Math.abs(
          Math.sqrt(currEvent.priceInverse) - Math.sqrt(inverseBeforeJump)
        );
        const sqrtDeltaInversePriceInverse = Math.abs(
          1 / Math.sqrt(currEvent.priceInverse) -
            1 / Math.sqrt(inverseBeforeJump)
        );
        const deltaPriceInverse = Math.abs(
          currEvent.priceInverse - inverseBeforeJump
        );
        acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;
        inverseBeforeJump = currEvent.priceInverse;
        acc.sqrtDeltaPriceInverse =
          acc.sqrtDeltaPriceInverse + sqrtDeltaPriceInverse;
        acc.sqrtDeltaInversePriceInverse =
          acc.sqrtDeltaInversePriceInverse + sqrtDeltaInversePriceInverse;

        acc.F =
          acc.F +
          sqrtDelta * (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);

        acc.inverseF =
          acc.inverseF +
          sqrtDeltaInverse *
            (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);

        acc.FPriceInverse =
          acc.FPriceInverse +
          sqrtDeltaPriceInverse *
            (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);
        acc.inverseFPriceInverse =
          acc.inverseFPriceInverse +
          sqrtDeltaInversePriceInverse *
            (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);
        console.log(
          `Skipping event: missing prev, but adding ${deltaPrice} to lSum`
        );
        return acc;
      }

      // Condition: current event EXIST and prev event EXIST

      // ####### PRICE #######
      const deltaPrice = Math.abs(currEvent.price - prevEvent.price);
      const sqrtDelta = Math.abs(
        Math.sqrt(currEvent.price) - Math.sqrt(prevEvent.price)
      );
      const sqrtDeltaInverse = Math.abs(
        1 / Math.sqrt(currEvent.priceInverse) -
          1 / Math.sqrt(prevEvent.priceInverse)
      );
      acc.lSum = acc.lSum + deltaPrice;
      acc.sqrtDelta = acc.sqrtDelta + sqrtDelta;
      acc.sqrtDeltaInverse = acc.sqrtDeltaInverse + sqrtDeltaInverse;
      acc.F =
        acc.F +
        sqrtDelta * (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);
      acc.inverseF =
        acc.inverseF +
        sqrtDeltaInverse * (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);

      // ####### PRICE INVERSE #######
      const deltaPriceInverse = Math.abs(
        prevEvent.priceInverse - currEvent.priceInverse
      );
      const sqrtDeltaPriceInverse = Math.abs(
        Math.sqrt(currEvent.priceInverse) - Math.sqrt(inverseBeforeJump)
      );
      const sqrtDeltaInversePriceInverse = Math.abs(
        1 / Math.sqrt(currEvent.priceInverse) - 1 / Math.sqrt(inverseBeforeJump)
      );
      acc.lSumInverse = acc.lSumInverse + deltaPriceInverse;
      acc.sqrtDeltaPriceInverse =
        acc.sqrtDeltaPriceInverse + sqrtDeltaPriceInverse;
      acc.sqrtDeltaInversePriceInverse =
        acc.sqrtDeltaInversePriceInverse + sqrtDeltaInversePriceInverse;
      acc.FPriceInverse =
        acc.FPriceInverse +
        sqrtDeltaPriceInverse *
          (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);
      acc.inverseFPriceInverse =
        acc.inverseFPriceInverse +
        sqrtDeltaInversePriceInverse *
          (parseInt(currEvent.raw.pool.feeTier) / 10000 / 100);

      priceBeforeJump = currEvent.price;
      inverseBeforeJump = currEvent.priceInverse;

      acc.lCumValues = [
        ...acc.lCumValues,
        { value: acc.lSum, label: currEvent.createdOn },
      ];
      // console.log(
      //   "Computing L",
      //   new Date(currEvent.createdOn).toISOString(),
      //   "|",
      //   acc.lSum,
      //   deltaPrice,
      //   currEvent.price,
      //   prevEvent.price,
      //   "|",
      //   currEvent.raw.transaction.blockNumber,
      //   currEvent.raw.transaction.id
      // );
      return acc;
    },
    {
      lSum: 0,
      lSumInverse: 0,
      sqrtDelta: 0,
      sqrtDeltaInverse: 0,
      lastProcessedIndex: 0,
      sqrtDeltaPriceInverse: 0,
      sqrtDeltaInversePriceInverse: 0,
      lCumValues: [],
      F: 0,
      inverseF: 0,
      FPriceInverse: 0,
      inverseFPriceInverse: 0,
    }
  );
  return {
    // Metrics Price
    lSum: metrics.lSum,
    sqrtDelta: metrics.sqrtDelta,
    F: metrics.F,
    inverseF: metrics.inverseF,
    sqrtDeltaPriceInverse: metrics.sqrtDeltaPriceInverse,

    // Metrics Price Inverse
    lSumInverse: metrics.lSumInverse,
    sqrtDeltaInverse: metrics.sqrtDeltaInverse,
    sqrtDeltaInversePriceInverse: metrics.sqrtDeltaInversePriceInverse,
    FPriceInverse: metrics.FPriceInverse,
    inverseFPriceInverse: metrics.inverseFPriceInverse,

    // Chart Data
    lCumValues: metrics.lCumValues,
    data: events as any, //.filter((el) => !!el) as TransformedPoolEvent[],

    // Log Data
    lastProcessedIndex: metrics.lastProcessedIndex,
  };
}

export interface PositionSettings {
  // + state price
  statePrice: number;
  // price
  lowerPrice: number;
  upperPrice: number;
  centerPrice: number;
  // tick
  lowerTick: number;
  upperTick: number;
  centerTick: number;
}

export interface PoolMetricsFinal extends PoolMetrics {
  pnl: number;
  y_origin: number;
  y_final: number;
  apy_hedged: number;
}

export interface PoolMetrics {
  // NEW pool metrics
  y_bucket: number;
  F_y: number;
  F_x: number;
  pnl_array: { time: number; value: number }[];
  pnl_and_price: { price: number; pnl: number }[];
  positionMovementEvent: {
    time: number;
    value: string;
    position: PositionSettings;
  }[];
}
export interface MetricsSettings {
  // Now expressed in tick
  hysteresis: number;
  slippage: number;
  swapFee: number;
}

export function getClosestTick(
  targetPrice: number,
  tickSpacing: number
): number {
  for (let i = 1; i < 1_000_000; i++) {
    const price = 1.0001 ** ((i - 500_000) * tickSpacing);
    if (Math.abs(price / targetPrice - 1) < tickSpacing / 2 / 10_000) {
      return (i - 500_000) * tickSpacing;
    }
  }
  return 0;
}

export function getPriceFromTick(tick: number): number {
  return 1.0001 ** tick;
}

export function computePoolMetrics(
  events: TransformedPoolEvent[],
  settings: MetricsSettings
): PoolMetricsFinal {
  const firstEvent = events[0];

  // console.log("First price", firstEvent);

  // fee remains constant because all events are from the same pool
  const fee = parseInt(firstEvent.raw.pool.feeTier) / 10_000 / 100;

  const tickSpacing = fee * 2 * 10_000; // with feeTier of 3000 => 60

  const closestTick = getClosestTick(firstEvent.price, tickSpacing);

  // Compute tick
  const lowerTick = closestTick - settings.hysteresis * tickSpacing;
  const centerTick = closestTick;
  const upperTick = closestTick + settings.hysteresis * tickSpacing;

  let position: PositionSettings = {
    // tick
    lowerTick: lowerTick,
    centerTick: centerTick,
    upperTick: upperTick,
    // state price
    statePrice: firstEvent.price,
    // prices
    lowerPrice: getPriceFromTick(lowerTick),
    centerPrice: getPriceFromTick(centerTick),
    upperPrice: getPriceFromTick(upperTick),
  };

  const y_initial =
    Math.sqrt(position.statePrice) - Math.sqrt(position.lowerPrice);
  const x_initial =
    1 / Math.sqrt(position.statePrice) - 1 / Math.sqrt(position.upperPrice);

  // const y_origin =
  //   y_initial +
  //   x_initial *
  //     (position.statePrice *
  //       (1 + settings.swapFee / 100 + settings.slippage / 100));

  const lastIndex = events.length - 1;

  let y_final = 0;
  let x_final = 0;
  const metrics: PoolMetrics = events.reduce(
    (acc: PoolMetrics, currEvent: TransformedPoolEvent, index: number) => {
      // ############### SKIP elements ###############
      if (index === 0) {
        return acc;
      }

      // if (lastIndex === index) {
      //   // keep last element for the last swap
      //   return acc;
      // }
      // if (index > 4) return acc;
      // ############### SKIP elements ###############

      const fee = parseInt(currEvent.raw.pool.feeTier) / 10000 / 100;

      const prevEvent = events[index - 1];

      // ############### FEE ###############

      if (
        currEvent.price < position.upperPrice &&
        currEvent.price > position.lowerPrice
      ) {
        // add fee only for in range positions
        const delta_SqrtPrice =
          Math.sqrt(currEvent.price) - Math.sqrt(prevEvent.price);
        const delta_SqrtPrice_inverse =
          1 / Math.sqrt(currEvent.price) - 1 / Math.sqrt(prevEvent.price);

        const F_y = Math.max(delta_SqrtPrice, 0) * fee;
        acc.F_y = acc.F_y + F_y;

        const F_x = Math.max(delta_SqrtPrice_inverse, 0) * fee;
        acc.F_x = acc.F_x + F_x;
      }

      // ############### FEE ###############

      // ############### RANGE MOVE ###############
      if (currEvent.price > position.upperPrice) {
        // ############### Move liquidity UP ###############
        const y_range_old =
          Math.sqrt(position.upperPrice) - Math.sqrt(position.lowerPrice);
        acc.y_bucket = acc.y_bucket + y_range_old;

        // swap all fees
        acc.y_bucket =
          acc.y_bucket +
          acc.F_y +
          acc.F_x * (currEvent.price * (1 - fee - settings.slippage / 100));

        // Reset fee counter
        acc.F_x = 0;
        acc.F_y = 0;

        // Create new range

        const lowerTick = position.centerTick;
        const centerTick = position.upperTick;
        const upperTick =
          position.upperTick + settings.hysteresis * tickSpacing;

        position = {
          lowerTick: lowerTick,
          centerTick: centerTick,
          upperTick: upperTick,
          statePrice: currEvent.price,
          lowerPrice: getPriceFromTick(lowerTick),
          centerPrice: getPriceFromTick(centerTick),
          upperPrice: getPriceFromTick(upperTick),
        };

        const y_new =
          Math.sqrt(position.statePrice) - Math.sqrt(position.lowerPrice);
        const x_new =
          1 / Math.sqrt(position.statePrice) -
          1 / Math.sqrt(position.upperPrice);

        acc.y_bucket = acc.y_bucket - y_new;
        acc.y_bucket =
          acc.y_bucket -
          x_new * (position.statePrice * (1 + fee + settings.slippage / 100));

        acc.positionMovementEvent = [
          ...acc.positionMovementEvent,
          { time: parseInt(currEvent.raw.timestamp), value: "UP", position },
        ];
      }

      if (currEvent.price < position.lowerPrice) {
        // ############### Move liquidity DOWN ###############
        const x_range_old =
          1 / Math.sqrt(position.lowerPrice) -
          1 / Math.sqrt(position.upperPrice);

        let x_available = x_range_old + acc.F_x;

        // Swap all fees
        acc.y_bucket = acc.y_bucket + acc.F_y;

        // Reset fee counter
        acc.F_x = 0;
        acc.F_y = 0;

        // Create new range
        const lowerTick =
          position.lowerTick - settings.hysteresis * tickSpacing;
        const centerTick = position.lowerTick;
        const upperTick = position.centerTick;

        position = {
          lowerTick: lowerTick,
          centerTick: centerTick,
          upperTick: upperTick,
          statePrice: currEvent.price,
          lowerPrice: getPriceFromTick(lowerTick),
          centerPrice: getPriceFromTick(centerTick),
          upperPrice: getPriceFromTick(upperTick),
        };

        const y_new =
          Math.sqrt(position.statePrice) - Math.sqrt(position.lowerPrice);
        const x_new =
          1 / Math.sqrt(position.statePrice) -
          1 / Math.sqrt(position.upperPrice);

        let y_to_obtain_via_swap = 0;

        // take as much as possible from the bucket
        if (acc.y_bucket >= y_new) {
          y_to_obtain_via_swap = 0;
          acc.y_bucket = acc.y_bucket - y_new;
        } else {
          y_to_obtain_via_swap = y_new - acc.y_bucket;
          acc.y_bucket = 0;
        }

        // check how many x are still available after put aside the x_new for the swap (if any)

        if (x_available >= x_new) {
          x_available = x_available - x_new;
        } else {
          x_available = 0;
          // add fee and swap because subtracting from the bucket
          acc.y_bucket =
            acc.y_bucket -
            (x_new - x_available) *
              position.statePrice *
              (1 + fee + settings.slippage / 100);
        }

        // swap x left into y and add to the bucket
        acc.y_bucket =
          acc.y_bucket +
          x_available *
            (position.statePrice * (1 - fee - settings.slippage / 100));
        // remove the one obtained
        acc.y_bucket = acc.y_bucket - y_to_obtain_via_swap;

        // Update event
        acc.positionMovementEvent = [
          ...acc.positionMovementEvent,
          { time: parseInt(currEvent.raw.timestamp), value: "DOWN", position },
        ];
      }
      // ############### RANGE MOVE ###############

      const x_now =
        1 / Math.sqrt(currEvent.price) - 1 / Math.sqrt(position.upperPrice);

      const y_now = Math.sqrt(currEvent.price) - Math.sqrt(position.lowerPrice);

      x_final = acc.F_x + x_now;

      y_final = y_now + acc.y_bucket + acc.F_y;

      // ############### PRICE & PNL for each event ###############
      let y_from_x = 0;
      if (x_final > x_initial) {
        y_from_x =
          (x_final - x_initial) *
          currEvent.price *
          (1 - fee - settings.slippage / 100);
      } else {
        y_from_x =
          (x_final - x_initial) *
          currEvent.price *
          (1 + fee + settings.slippage / 100);
      }

      const pnl = y_final - y_initial + y_from_x;

      acc.pnl_array = [
        ...acc.pnl_array,
        { value: pnl, time: parseInt(currEvent.raw.timestamp) },
      ];

      acc.pnl_and_price = [
        ...acc.pnl_and_price,
        { price: currEvent.price, pnl },
      ];
      return acc;
    },
    {
      // New counter
      F_y: 0,
      F_x: 0,
      y_bucket: 0,
      pnl_array: [],
      positionMovementEvent: [],
      pnl_and_price: [],
    }
  );

  // ############### FINAL PART ###############
  const lastEvent = events[lastIndex];

  let y_from_x = 0;
  if (x_final > x_initial) {
    y_from_x =
      (x_final - x_initial) *
      lastEvent.price *
      (1 - fee - settings.slippage / 100);
  } else {
    y_from_x =
      (x_final - x_initial) *
      lastEvent.price *
      (1 + fee + settings.slippage / 100);
  }

  const pnl = y_final - y_initial + y_from_x;

  const seconds =
    parseInt(lastEvent.raw.timestamp) - parseInt(firstEvent.raw.timestamp);
  const seconds_in_year = 60 * 60 * 24 * 365;

  const apy_hedged =
    (pnl / (y_initial + x_initial * firstEvent.price) / seconds) *
    seconds_in_year *
    100;

  // console.log("Metrics", metrics);
  return {
    ...metrics,
    pnl,
    y_origin: y_initial,
    y_final,
    apy_hedged,
  };
}
