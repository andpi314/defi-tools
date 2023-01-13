export interface DateRange {
  start: number;
  end: number;
}

export interface DateRangeSamplerSettings {
  start: Date;
  end?: Date;
  maxSamples?: number;
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
