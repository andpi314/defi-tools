import { BigNumber } from "bignumber.js"

const toNumber = (value: BigNumber) => parseFloat(value.toString())

export const mul = (value1: number | string, value2: number | string): number =>
  toNumber(new BigNumber(value1).multipliedBy(new BigNumber(value2)))

export const abs = (x: number): number => toNumber(new BigNumber(x).abs())

export const div = (value1: number, value2: number): number =>
  toNumber(new BigNumber(value1).div(new BigNumber(value2)))

export const add = (value1: number, value2?: number): number =>
  toNumber(new BigNumber(value1).plus(new BigNumber(value2 || 0)))

export const sub = (value1: number, value2?: number): number =>
  toNumber(new BigNumber(value1).minus(new BigNumber(value2 || 0)))

export const sqrt = (x: number): number => toNumber(new BigNumber(x).sqrt())

export const pow = (base: number, exponent: number): number =>
  toNumber(new BigNumber(base).pow(exponent))

export const percent = (numerator: number, denominator: number): number => {
  return toNumber(new BigNumber(numerator).div(new BigNumber(denominator)))
}

export const isNegative = (value: number): boolean =>
  new BigNumber(value).isNegative()

export const isPositive = (value: number): boolean => !isNegative(value)

export const isGreaterThanOrEqualTo = (
  value1: number,
  value2: number
): boolean => {
  return new BigNumber(value1).isGreaterThanOrEqualTo(new BigNumber(value2))
}

export class BigN {
  constructor(private n: number) {}

  add(n: number): BigN {
    return new BigN(add(this.n, n))
  }
  sub(n: number): BigN {
    return new BigN(sub(this.n, n))
  }

  abs(): BigN {
    return new BigN(abs(this.n))
  }

  mul(n: number): BigN {
    return new BigN(mul(this.n, n))
  }

  div(n: number): BigN {
    return new BigN(div(this.n, n))
  }

  sqrt(): BigN {
    return new BigN(sqrt(this.n))
  }

  pow(exponent: number): BigN {
    return new BigN(pow(this.n, exponent))
  }

  isNegative(): boolean {
    return isNegative(this.n)
  }
  isPositive(): boolean {
    return !isNegative(this.n)
  }

  toNumber() {
    return this.n
  }
}
