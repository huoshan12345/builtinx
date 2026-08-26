const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;   //     60,000
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;     //  3,600,000
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;        // 86,400,000

export class TimeSpan {
  private _millis: number;

  private static interval(value: number, scale: number): TimeSpan {
    if (!Number.isFinite(value)) {
      throw new RangeError("Value must be finite.");
    }

    const tmp = value * scale;
    const millis = TimeSpan.round(tmp + (value >= 0 ? 0.5 : -0.5));
    return new TimeSpan(millis);
  }

  private static round(n: number): number {
    if (n < 0) {
      return Math.ceil(n);
    } else if (n > 0) {
      return Math.floor(n);
    }

    return 0;
  }

  public static get zero(): TimeSpan {
    return new TimeSpan(0);
  }

  public static get maxValue(): TimeSpan {
    return new TimeSpan(Number.MAX_SAFE_INTEGER);
  }

  public static get minValue(): TimeSpan {
    return new TimeSpan(Number.MIN_SAFE_INTEGER);
  }

  public static fromDays(value: number): TimeSpan {
    return TimeSpan.interval(value, MILLIS_PER_DAY);
  }

  public static fromHours(value: number): TimeSpan {
    return TimeSpan.interval(value, MILLIS_PER_HOUR);
  }

  public static fromMilliseconds(value: number): TimeSpan {
    return TimeSpan.interval(value, 1);
  }

  public static fromMinutes(value: number): TimeSpan {
    return TimeSpan.interval(value, MILLIS_PER_MINUTE);
  }

  public static fromSeconds(value: number): TimeSpan {
    return TimeSpan.interval(value, MILLIS_PER_SECOND);
  }

  public static from(days: number, hours: number, minutes: number, seconds: number = 0, milliseconds: number = 0): TimeSpan {
    const totalMilliSeconds = (days * MILLIS_PER_DAY)
      + (hours * MILLIS_PER_HOUR)
      + (minutes * MILLIS_PER_MINUTE)
      + (seconds * MILLIS_PER_SECOND)
      + milliseconds;

    return new TimeSpan(totalMilliSeconds);
  }

  /**
   * Creates a duration from an integer number of milliseconds.
   *
   * The value must be a finite safe integer. The single-unit factory methods round
   * fractional units before they reach this constructor.
   */
  constructor(millis: number) {
    if (!Number.isSafeInteger(millis)) {
      throw new RangeError("Milliseconds must be a finite safe integer.");
    }

    this._millis = millis;
  }

  public get days(): number {
    return TimeSpan.round(this._millis / MILLIS_PER_DAY);
  }

  public get hours(): number {
    return TimeSpan.round((this._millis / MILLIS_PER_HOUR) % 24);
  }

  public get minutes(): number {
    return TimeSpan.round((this._millis / MILLIS_PER_MINUTE) % 60);
  }

  public get seconds(): number {
    return TimeSpan.round((this._millis / MILLIS_PER_SECOND) % 60);
  }

  public get milliseconds(): number {
    return TimeSpan.round(this._millis % 1000);
  }

  public get totalDays(): number {
    return this._millis / MILLIS_PER_DAY;
  }

  public get totalHours(): number {
    return this._millis / MILLIS_PER_HOUR;
  }

  public get totalMinutes(): number {
    return this._millis / MILLIS_PER_MINUTE;
  }

  public get totalSeconds(): number {
    return this._millis / MILLIS_PER_SECOND;
  }

  public get totalMilliseconds(): number {
    return this._millis;
  }

  public add(ts: TimeSpan): TimeSpan {
    const result = this._millis + ts.totalMilliseconds;
    return new TimeSpan(result);
  }

  public subtract(ts: TimeSpan): TimeSpan {
    const result = this._millis - ts.totalMilliseconds;
    return new TimeSpan(result);
  }

  static regDuration = /^(?:(-?\d+)\.)?(-?\d+):(-?\d+):(-?\d+)$/;

  /**
   * Parses a duration formatted as `hours:minutes:seconds` or
   * `days.hours:minutes:seconds`.
   */
  public static parse(str: string): TimeSpan {
    const match = this.regDuration.exec(str);
    if (!match) {
      throw new Error("Invalid format: " + str);
    }

    const days = Number.parseInt(match[1] ?? '0', 10);
    const hours = Number.parseInt(match[2], 10);
    const minutes = Number.parseInt(match[3], 10);
    const seconds = Number.parseInt(match[4], 10);
    return TimeSpan.from(days, hours, minutes, seconds);
  }

  toString(): string {
    const days = this.days;
    const str = `${this.hours}:${this.minutes}:${this.seconds}`;
    return days
      ? `${days}.${str}`
      : str;
  }
}
