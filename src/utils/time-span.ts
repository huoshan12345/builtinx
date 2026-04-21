const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;   //     60,000
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;     //  3,600,000
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;        // 86,400,000

export class TimeSpan {
  private _millis: number;

  private static interval(value: number, scale: number): TimeSpan {
    if (Number.isNaN(value)) {
      throw new Error("value can't be NaN");
    }

    const tmp = value * scale;
    const millis = TimeSpan.round(tmp + (value >= 0 ? 0.5 : -0.5));
    if ((millis > TimeSpan.maxValue.totalMilliseconds) || (millis < TimeSpan.minValue.totalMilliseconds)) {
      throw new Error("TimeSpanTooLong");
    }

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

    if (totalMilliSeconds > TimeSpan.maxValue.totalMilliseconds || totalMilliSeconds < TimeSpan.minValue.totalMilliseconds) {
      throw new Error("TimeSpanTooLong");
    }
    return new TimeSpan(totalMilliSeconds);
  }

  constructor(millis: number) {
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

  static regDuration = /^(?:(\d+):)?(\d+):(\d+)$/;
  public static parse(str: string): TimeSpan {
    const match = this.regDuration.exec(str);
    if (!match) {
      throw new Error("Invalid format: " + str);
    }

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    return TimeSpan.from(0, hours, minutes, seconds);
  }

  toString(): string {
    const days = this.days;
    const str = `${this.hours}:${this.minutes}:${this.seconds}`;
    return days
      ? `${days}.${str}`
      : str;
  }
}