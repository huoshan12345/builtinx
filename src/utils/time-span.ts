const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;   //     60,000
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;     //  3,600,000
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;        // 86,400,000

type DurationField = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'meridiem';

const FORMAT_TOKENS: Record<string, { field: DurationField; pattern: string }> = {
  D: { field: 'days', pattern: '\\d+' },
  d: { field: 'days', pattern: '\\d+' },
  DD: { field: 'days', pattern: '\\d{2,}' },
  dd: { field: 'days', pattern: '\\d{2,}' },
  H: { field: 'hours', pattern: '\\d{1,2}' },
  HH: { field: 'hours', pattern: '\\d{2}' },
  h: { field: 'hours', pattern: '\\d{1,2}' },
  hh: { field: 'hours', pattern: '\\d{2}' },
  m: { field: 'minutes', pattern: '\\d{1,2}' },
  mm: { field: 'minutes', pattern: '\\d{2}' },
  s: { field: 'seconds', pattern: '\\d{1,2}' },
  ss: { field: 'seconds', pattern: '\\d{2}' },
  sss: { field: 'milliseconds', pattern: '\\d{3}' },
  SSS: { field: 'milliseconds', pattern: '\\d{3}' },
  A: { field: 'meridiem', pattern: 'AM|PM' },
  a: { field: 'meridiem', pattern: 'am|pm' },
};

function tokenizeDurationFormat(format: string): { token?: string; literal?: string }[] {
  const parts: { token?: string; literal?: string }[] = [];
  for (let index = 0; index < format.length;) {
    const char = format[index];
    if (char === '[') {
      const end = format.indexOf(']', index + 1);
      if (end === -1) {
        throw new Error('Unclosed literal in duration format: ' + format);
      }
      parts.push({ literal: format.slice(index + 1, end) });
      index = end + 1;
    } else if (/[A-Za-z]/.test(char)) {
      let end = index + 1;
      while (format[end] === char) {
        end++;
      }
      const token = format.slice(index, end);
      if (!FORMAT_TOKENS[token]) {
        throw new Error('Unsupported duration token: ' + token);
      }
      parts.push({ token });
      index = end;
    } else {
      if (char === ']') {
        throw new Error('Unexpected closing bracket in duration format: ' + format);
      }
      parts.push({ literal: char });
      index++;
    }
  }
  return parts;
}

function compileDurationFormat(format: string): { regex: RegExp; fields: DurationField[]; twelveHour: boolean } {
  const fields: DurationField[] = [];
  let pattern = '^(-?)';
  let twelveHour = false;
  for (const { token, literal } of tokenizeDurationFormat(format)) {
    if (token === undefined) {
      pattern += literal!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      continue;
    }
    const definition = FORMAT_TOKENS[token];
    if (fields.includes(definition.field)) {
      throw new Error('Duplicate duration field in format: ' + format);
    }
    fields.push(definition.field);
    pattern += '(' + definition.pattern + ')';
    twelveHour ||= token === 'h' || token === 'hh';
  }

  if (fields.length === 0 || twelveHour !== fields.includes('meridiem')) {
    throw new Error('Duration formats need numeric fields, and h/hh must be paired with A/a: ' + format);
  }

  // Unlike $, this assertion also rejects a trailing newline.
  return { regex: new RegExp(pattern + '(?![\\s\\S])'), fields, twelveHour };
}

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
   * `days.hours:minutes:seconds` when no formats are supplied.
   *
   * Custom formats are tried in order and must match the entire input. Supported
   * tokens: D/d, DD/dd (days), H/HH, h/hh with A/a, m/mm, s/ss, SSS/sss.
   * Double tokens require two digits; DD/dd allow additional digits. Milliseconds
   * require three digits. Use [text] for literals and a leading minus on the input
   * for negative durations. Omitted components default to zero.
   *
   * Throws for invalid formats, unmatched inputs, or unsafe millisecond totals.
   */
  public static parse(str: string, ...formats: string[]): TimeSpan {
    if (formats.length > 0) {
      // Validate every format before attempting matches, even if an earlier one matches.
      const compiledFormats = formats.map(compileDurationFormat);
      for (const { regex, fields, twelveHour } of compiledFormats) {
        const match = regex.exec(str);
        if (!match) {
          continue;
        }

        const values = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        let meridiem = '';
        fields.forEach((field, index) => {
          const value = match[index + 2];
          if (field === 'meridiem') {
            meridiem = value.toLowerCase();
          } else {
            values[field] = Number(value);
          }
        });

        if (values.hours > (twelveHour ? 12 : 23)
          || (twelveHour && values.hours === 0)
          || values.minutes > 59 || values.seconds > 59) {
          continue;
        }
        if (twelveHour) {
          values.hours = values.hours % 12 + (meridiem === 'pm' ? 12 : 0);
        }

        const millis = values.days * MILLIS_PER_DAY
          + values.hours * MILLIS_PER_HOUR
          + values.minutes * MILLIS_PER_MINUTE
          + values.seconds * MILLIS_PER_SECOND
          + values.milliseconds;
        return new TimeSpan(match[1] === '-' ? -millis : millis);
      }
      throw new Error('Input does not match any duration format: ' + str);
    }

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

  /**
   * Formats duration components using the same tokens and [literal] syntax as parse.
   * Negative durations have one leading minus; omitted components are not displayed.
   * Formatting permits repeated tokens and h/hh without A/a. Without a format,
   * preserves the original unpadded output (which omits milliseconds).
   */
  public toString(format?: string): string {
    if (format !== undefined) {
      const hours = Math.abs(this.hours);
      const values = {
        days: Math.abs(this.days),
        hours,
        minutes: Math.abs(this.minutes),
        seconds: Math.abs(this.seconds),
        milliseconds: Math.abs(this.milliseconds),
      };
      const result = tokenizeDurationFormat(format).map(({ token, literal }) => {
        if (token === undefined) {
          return literal!;
        }
        if (token === 'A' || token === 'a') {
          const meridiem = hours < 12 ? 'AM' : 'PM';
          return token === 'a' ? meridiem.toLowerCase() : meridiem;
        }
        const field = FORMAT_TOKENS[token].field as Exclude<DurationField, 'meridiem'>;
        const value = token === 'h' || token === 'hh' ? hours % 12 || 12 : values[field];
        return String(value).padStart(token.length, '0');
      }).join('');
      return this._millis < 0 ? '-' + result : result;
    }

    const days = this.days;
    const str = `${this.hours}:${this.minutes}:${this.seconds}`;
    return days
      ? `${days}.${str}`
      : str;
  }
}
