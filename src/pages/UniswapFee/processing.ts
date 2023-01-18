import { PanOnScrollMode } from "reactflow";
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

export interface PoolMetrics {
  deltaY_SqrtPrice: number;
  deltaX_SqrtPrice: number;
  F_y: number;
  F_x: number;
  delta_x_signed: number;
  delta_y_signed: number;
}

export interface PoolMetricsFinal extends PoolMetrics {
  pnl: number;
  delta_X: number;
  delta_Y: number;
}

export interface PositionSettings {
  lowerPrice: number;
  mediumLowerPrice: number;
  mediumUpperPrice: number;
  upperPrice: number;
}

export interface MetricsSettings {
  hysteresis: number;
  slippage: number;
  swapFee: number;
}

export function computePoolMetrics(
  events: TransformedPoolEvent[],
  settings: MetricsSettings
): PoolMetricsFinal {
  const firstEvent = events[0];

  // console.log("First price", firstEvent);

  let position = {
    lowerPrice: firstEvent.price * (1 - (1.5 * settings.hysteresis) / 100),
    mediumLowerPrice:
      firstEvent.price * (1 - (0.5 * settings.hysteresis) / 100),
    mediumUpperPrice:
      firstEvent.price * (1 + (0.5 * settings.hysteresis) / 100),
    upperPrice: firstEvent.price * (1 + (1.5 * settings.hysteresis) / 100),
  };

  // console.log("STARTING POSITION", position);

  const lastIndex = events.length - 1;

  const metrics: PoolMetrics = events.reduce(
    (acc: PoolMetrics, currEvent: TransformedPoolEvent, index: number) => {
      if (index === 0) {
        return acc;
      }

      if (lastIndex === index) {
        // keep last element for the last swap
        return acc;
      }

      // if (index > 4) return acc;

      const fee = parseInt(currEvent.raw.pool.feeTier) / 10000 / 100;

      const prevEvent = events[index - 1];

      // ############### RANGE ###############
      const deltaY_SqrtPrice =
        Math.sqrt(currEvent.price) - Math.sqrt(prevEvent.price);

      const deltaX_SqrtPrice =
        1 / Math.sqrt(currEvent.price) - 1 / Math.sqrt(prevEvent.price);

      acc.deltaY_SqrtPrice = acc.deltaY_SqrtPrice + deltaY_SqrtPrice;
      acc.deltaX_SqrtPrice = acc.deltaX_SqrtPrice + deltaX_SqrtPrice;
      // ############### RANGE ###############

      console.log(
        index,
        "SQRT",
        deltaX_SqrtPrice,
        deltaY_SqrtPrice,
        "| cum",
        acc.deltaX_SqrtPrice,
        acc.deltaY_SqrtPrice,
        "| price",
        currEvent.price,
        prevEvent.price
      );

      // ############### FEE ###############
      const F_y = Math.max(deltaY_SqrtPrice, 0) * fee;
      const F_x = Math.max(deltaX_SqrtPrice, 0) * fee;

      acc.F_y = acc.F_y + F_y;
      acc.F_x = acc.F_x + F_x;
      // ############### FEE ###############

      // ############### RANGE MOVE ###############
      if (currEvent.price > position.upperPrice) {
        // ############### Move liquidity UP ###############

        // Delta y to move (not adjusted for price shift above target price)

        const delta_y_signed =
          Math.sqrt(position.lowerPrice) -
          Math.sqrt(position.mediumLowerPrice) -
          (Math.sqrt(currEvent.price) - Math.sqrt(position.upperPrice));

        const delta_x_signed =
          -delta_y_signed /
          (currEvent.price *
            (1 + settings.swapFee / 100 + settings.slippage / 100));

        console.log("LIQ UP", delta_x_signed, delta_y_signed, position);

        acc.delta_x_signed = acc.delta_x_signed + delta_x_signed;
        acc.delta_y_signed = acc.delta_y_signed + delta_y_signed;

        // Liquidity shift
        position.lowerPrice = position.mediumLowerPrice;
        position.mediumLowerPrice = position.mediumUpperPrice;
        position.mediumUpperPrice = position.upperPrice;
        position.upperPrice =
          position.upperPrice * (1 + settings.hysteresis / 100);
        // ############### Move liquidity U P ###############
      }

      if (currEvent.price < position.lowerPrice) {
        // ############### Move liquidity DOWN ###############

        const delta_x_signed =
          1 / Math.sqrt(position.upperPrice) -
          1 / Math.sqrt(position.mediumUpperPrice) -
          (1 / Math.sqrt(currEvent.price) - 1 / Math.sqrt(position.lowerPrice));

        const delta_y_signed =
          -delta_x_signed *
          (currEvent.price *
            (1 - settings.swapFee / 100 - settings.slippage / 100));

        console.log("LIQ DOWN ", delta_x_signed, delta_y_signed, position);

        acc.delta_y_signed = acc.delta_y_signed + delta_y_signed;
        acc.delta_x_signed = acc.delta_x_signed + delta_x_signed;
        // Liquidity shift
        position.upperPrice = position.mediumUpperPrice;
        position.mediumUpperPrice = position.mediumLowerPrice;
        position.mediumLowerPrice = position.lowerPrice;
        position.lowerPrice =
          position.lowerPrice * (1 - settings.hysteresis / 100);
      }
      // ############### RANGE MOVE ###############

      return acc;
    },
    {
      deltaY_SqrtPrice: 0,
      deltaX_SqrtPrice: 0,
      F_y: 0,
      F_x: 0,
      delta_x_signed: 0,
      delta_y_signed: 0,
    }
  );

  const lastEvent = events[lastIndex];

  // console.log("Last price", lastEvent);

  // ############### SUM OF METRICS ###############
  const delta_X =
    metrics.F_x + metrics.deltaX_SqrtPrice + metrics.delta_x_signed;
  const delta_Y =
    metrics.F_y + metrics.deltaY_SqrtPrice + metrics.delta_y_signed;

  // ############### PnL ###############
  const pnl =
    delta_Y +
    delta_X *
      (lastEvent.price *
        (1 - settings.swapFee / 100 - settings.slippage / 100));

  // console.log("Metrics", metrics);
  return {
    ...metrics,
    delta_X,
    delta_Y,
    pnl: pnl * 1000,
  };
}
