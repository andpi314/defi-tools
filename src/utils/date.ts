import { intervalToDuration as _intervalToDuration } from "date-fns";
export interface DateRange {
  start: number;
  end: number;
}

export interface DateRangeSamplerSettings {
  start: Date;
  end?: Date;
  maxSamples?: number;
}

export function createRanges({
  count,
  end,
  start,
}: {
  count: number;
  end: Date;
  start: Date;
}): DateRange[] {
  const ranges: DateRange[] = [];
  const range = end.getTime() - start.getTime();
  const step = range / count;
  let current = start.getTime();
  while (current < end.getTime()) {
    const range = {
      start: new Date(current).getTime(),
      end: new Date(current + step).getTime(),
    };
    ranges.push(range);
    current += step;
  }
  return ranges;
}

/**
 * Create a range of equally spaced dates based on staring date, end date and max samples
 */
export class DateRangeSampler {
  private start: Date;
  private end: Date;
  private maxSamples: number;
  private ranges: DateRange[];

  constructor({ start, end, maxSamples }: DateRangeSamplerSettings) {
    this.start = start;
    this.end = end || new Date();
    this.maxSamples = maxSamples || 30;
    this.ranges = this.createRanges();
  }

  /**
   * Create an array of dates with lower and upper bounds, taking the date range limits
   * and the max samples into account. Using discrete steps
   *
   * @returns Array of DateRange objects
   */
  private createRanges(): DateRange[] {
    const ranges: DateRange[] = [];
    const range = this.end.getTime() - this.start.getTime();
    const step = range / this.maxSamples;
    let current = this.start.getTime();
    while (current < this.end.getTime()) {
      const range = {
        start: new Date(current).getTime(),
        end: new Date(current + step).getTime(),
      };
      ranges.push(range);
      current += step;
    }
    return ranges;
  }

  public getRanges(): DateRange[] {
    return this.ranges;
  }
}

interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function intervalToDuration(
  start: string | Date,
  end?: string | Date
): Duration {
  const _start = new Date(start).getTime();
  const _end = end ? new Date(end).getTime() : new Date().getTime();

  const timeObj = _intervalToDuration({
    start: _start,
    end: _end,
  });

  return {
    years: timeObj.years || 0,
    months: timeObj.months || 0,
    days: timeObj.days || 0,
    hours: timeObj.hours || 0,
    minutes: timeObj.minutes || 0,
    seconds: timeObj.seconds || 0,
  };
}

/**
 * Parse a string or Date in an easy to read string, hiding unuseful params
 *
 * @example '1d 0h 15m 4s ago'
 *
 * @param {string | Date} date to parse
 * @returns
 */
export function parseIntervalAsString(
  date: string | Date,
  dateEnd?: string | Date
): string {
  const obj = intervalToDuration(date, dateEnd);
  const fullString = Object.entries(obj).reduce((acc, curr, index) => {
    const [key, value] = curr;
    if (value === 0) return acc;
    acc = `${index !== 0 ? `${acc} ` : ""}${value}${key.charAt(0)}`;
    return acc;
  }, "");
  return fullString;
}
