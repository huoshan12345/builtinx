import { TimeSpan } from '@/utils/time-span.js';

describe('TimeSpan validation', () => {
  it('accepts only finite safe integer milliseconds in the constructor', () => {
    expect(new TimeSpan(42).totalMilliseconds).toBe(42);

    expect(() => new TimeSpan(Number.NaN)).toThrow(RangeError);
    expect(() => new TimeSpan(Infinity)).toThrow(RangeError);
    expect(() => new TimeSpan(0.5)).toThrow(RangeError);
    expect(() => new TimeSpan(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('rejects non-finite factory inputs before rounding', () => {
    expect(() => TimeSpan.fromMilliseconds(Number.NaN)).toThrow(RangeError);
    expect(() => TimeSpan.fromSeconds(Infinity)).toThrow(RangeError);
  });

  it('validates the total produced by from', () => {
    expect(() => TimeSpan.from(0, 0, 0, 0, Number.NaN)).toThrow(RangeError);
    expect(() => TimeSpan.from(0, 0, 0, 0, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('validates arithmetic results through the constructor', () => {
    expect(() => TimeSpan.maxValue.add(TimeSpan.fromMilliseconds(1))).toThrow(RangeError);
    expect(() => TimeSpan.minValue.subtract(TimeSpan.fromMilliseconds(1))).toThrow(RangeError);
  });

  it('parses the days component', () => {
    const timeSpan = TimeSpan.parse('1.2:3:4');

    expect(timeSpan.totalMilliseconds).toBe(
      TimeSpan.from(1, 2, 3, 4).totalMilliseconds,
    );
  });

  it('round-trips string forms with positive and negative days', () => {
    for (const timeSpan of [
      TimeSpan.from(1, 2, 3, 4),
      TimeSpan.from(-1, -2, -3, -4),
    ]) {
      expect(TimeSpan.parse(timeSpan.toString()).totalMilliseconds)
        .toBe(timeSpan.totalMilliseconds);
    }
  });
});

describe('TimeSpan formatting', () => {
  it('formats all components with padding and compatibility aliases', () => {
    const duration = TimeSpan.from(2, 3, 4, 5, 6);
    expect(duration.toString('D HH:mm:ss.SSS')).toBe('2 03:04:05.006');
    expect(duration.toString('dd H:m:s.sss')).toBe('02 3:4:5.006');
    expect(duration.toString('d DD')).toBe('2 02');
    expect(TimeSpan.fromDays(123).toString('DD dd')).toBe('123 123');
    expect(TimeSpan.fromMilliseconds(999).toString('SSS')).toBe('999');
  });

  it.each([
    [0, '0 00 12 12 AM am'],
    [1, '1 01 1 01 AM am'],
    [12, '12 12 12 12 PM pm'],
    [13, '13 13 1 01 PM pm'],
    [23, '23 23 11 11 PM pm'],
  ])('formats 12-hour and 24-hour tokens for hour %s', (hours, expected) => {
    expect(TimeSpan.fromHours(hours).toString('H HH h hh A a')).toBe(expected);
  });

  it('uses hour components rather than total hours', () => {
    expect(TimeSpan.fromHours(25).toString('D HH:mm')).toBe('1 01:00');
  });

  it('preserves bracket literals without replacing tokens inside them', () => {
    expect(TimeSpan.from(1, 2, 3).toString('D[ days (HH) + ]HH[h.]mm[m]'))
      .toBe('1 days (HH) + 02h.03m');
    expect(TimeSpan.zero.toString('[literal]')).toBe('literal');
    expect(TimeSpan.zero.toString('')).toBe('');
    expect(TimeSpan.zero.toString('HH:mm:ss.SSS')).toBe('00:00:00.000');
  });

  it('uses one leading minus for negative durations, including subsecond values', () => {
    expect(TimeSpan.from(-1, -2, -3, -4, -5).toString('D HH:mm:ss.SSS'))
      .toBe('-1 02:03:04.005');
    expect(TimeSpan.fromMilliseconds(-1).toString('ss.SSS')).toBe('-00.001');
    expect(TimeSpan.fromHours(-13).toString('h A')).toBe('-1 PM');
  });

  it.each(['YYYY', 'SS', '[unclosed', 'HH]'])('rejects invalid format %s', (format) => {
    expect(() => TimeSpan.zero.toString(format)).toThrow();
  });

  it('round-trips complete formats including safe integer boundaries', () => {
    const durations = [TimeSpan.zero, TimeSpan.maxValue, TimeSpan.minValue,
      TimeSpan.from(123, 0, 59, 59, 999), TimeSpan.fromMilliseconds(-1),
      TimeSpan.from(2, 12, 0, 0, 1), TimeSpan.fromHours(-13)];
    for (const duration of durations) {
      for (const format of ['D HH:mm:ss.SSS', 'dd hh:mm:ss.sss A', 'd h:m:s.SSS a']) {
        expect(TimeSpan.parse(duration.toString(format), format).totalMilliseconds)
          .toBe(duration.totalMilliseconds);
      }
    }
  });

  it('preserves the original no-argument output', () => {
    expect(TimeSpan.from(1, 2, 3, 4, 5).toString()).toBe('1.2:3:4');
    expect(TimeSpan.from(-1, -2, -3, -4, -5).toString()).toBe('-1.-2:-3:-4');
    expect(TimeSpan.from(0, 2, 3, 4).toString(undefined)).toBe('2:3:4');
    expect(TimeSpan.zero.toString()).toBe('0:0:0');
  });
});

describe('TimeSpan total-unit formatting', () => {
  const options = { totalHighestUnit: true };

  it.each([
    ['h:m:s', '26:3:4'],
    ['HH:mm:ss.SSS', '26:03:04.005'],
    ['mm:ss', '1563:04'],
    ['ss.SSS', '93784.005'],
    ['sss', '93784005'],
    ['SSS', '93784005'],
    ['d HH:mm:ss', '1 02:03:04'],
    ['DD h:mm:ss a', '01 2:03:04 am'],
  ])('formats the largest unit as a total for %s', (format, expected) => {
    expect(TimeSpan.from(1, 2, 3, 4, 5).toString(format, options)).toBe(expected);
  });

  it('selects the largest unit regardless of token order, aliases, or literals', () => {
    const duration = TimeSpan.from(1, 2, 3, 4, 5);
    expect(duration.toString('ss:mm:HH [D d]', options)).toBe('04:03:26 D d');
    expect(duration.toString('h HH hh', options)).toBe('26 26 26');
    expect(duration.toString('dd HH', options)).toBe('01 02');
  });

  it('truncates fractional totals and preserves minimum padding', () => {
    expect(TimeSpan.from(0, 1, 2, 59, 999).toString('mm', options)).toBe('62');
    expect(TimeSpan.from(0, 1, 2, 59, 999).toString('ss', options)).toBe('3779');
    expect(TimeSpan.fromMinutes(3).toString('hh:mm', options)).toBe('00:03');
    expect(TimeSpan.fromMilliseconds(1).toString('SSS', options)).toBe('001');
    expect(TimeSpan.fromHours(123).toString('HH', options)).toBe('123');
    expect(TimeSpan.zero.toString('h:m:s', options)).toBe('0:0:0');
  });

  it.each(['h:mm A', 'hh:mm a', 'HH:mm A', 'a H:mm', 'hh:mm A [D]'])
  ('rejects total hours with meridiem in %s regardless of duration', (format) => {
    for (const duration of [TimeSpan.zero, TimeSpan.fromHours(2), TimeSpan.fromHours(26)]) {
      expect(() => duration.toString(format, options))
        .toThrow('Total hours cannot be combined with A/a');
    }
  });

  it('allows meridiem outside total-hour formats and ignores escaped meridiem tokens', () => {
    const duration = TimeSpan.from(1, 2, 3);
    expect(duration.toString('h:mm A', { totalHighestUnit: false })).toBe('2:03 AM');
    expect(duration.toString('D h:mm A', options)).toBe('1 2:03 AM');
    expect(duration.toString('h:mm a dd', options)).toBe('2:03 am 01');
    expect(duration.toString('HH:mm [A/a]', options)).toBe('26:03 A/a');
  });

  it('keeps lower components and a single leading minus for negative values', () => {
    expect(TimeSpan.from(-1, -2, -3, -4, -5).toString('hh:mm:ss.SSS', options))
      .toBe('-26:03:04.005');
    expect(TimeSpan.fromMilliseconds(-1).toString('ss.SSS', options)).toBe('-00.001');
    expect(TimeSpan.fromMilliseconds(-1).toString('sss', options)).toBe('-001');
  });

  it('preserves default behavior unless enabled with an explicit format', () => {
    const duration = TimeSpan.from(1, 14, 3, 4);
    expect(duration.toString('h:m:s')).toBe('2:3:4');
    expect(duration.toString('h:m:s', {})).toBe('2:3:4');
    expect(duration.toString('h:m:s', { totalHighestUnit: false })).toBe('2:3:4');
    expect(duration.toString('h:m:s', options)).toBe('38:3:4');
    expect(duration.toString(undefined, options)).toBe(duration.toString());
    expect(duration.toString('[HH]', options)).toBe('HH');
    expect(duration.toString('', options)).toBe('');
    expect(duration.toString('A a', options)).toBe('PM pm');
  });

  it('preserves safe integer extremes when milliseconds are the largest unit', () => {
    expect(TimeSpan.maxValue.toString('SSS', options)).toBe(String(Number.MAX_SAFE_INTEGER));
    expect(TimeSpan.minValue.toString('sss', options)).toBe(String(Number.MIN_SAFE_INTEGER));
    expect(TimeSpan.maxValue.toString('HH:mm:ss.SSS', options)).toBe('2501999792:59:00.991');
    expect(TimeSpan.minValue.toString('HH:mm:ss.SSS', options)).toBe('-2501999792:59:00.991');
  });
});

describe('TimeSpan format parsing', () => {
  it.each(['D', 'd', 'DD', 'dd'])('parses day token %s including durations over 99 days', (token) => {
    expect(TimeSpan.parse('123 04:05:06.007', `${token} HH:mm:ss.SSS`).totalMilliseconds)
      .toBe(TimeSpan.from(123, 4, 5, 6, 7).totalMilliseconds);
  });

  it.each(['SSS', 'sss'])('parses three-digit milliseconds with %s', (token) => {
    for (const value of ['000', '001', '123', '999']) {
      expect(TimeSpan.parse(value, token).totalMilliseconds).toBe(Number(value));
    }
    for (const value of ['1', '12', '1234']) {
      expect(() => TimeSpan.parse(value, token)).toThrow();
    }
  });

  it('accepts one or two digits for single hour, minute, and second tokens', () => {
    expect(TimeSpan.parse('1:2:3', 'H:m:s').totalMilliseconds)
      .toBe(TimeSpan.from(0, 1, 2, 3).totalMilliseconds);
    expect(TimeSpan.parse('23:59:59', 'H:m:s').totalMilliseconds)
      .toBe(TimeSpan.from(0, 23, 59, 59).totalMilliseconds);
    expect(TimeSpan.parse('01 02:03:04', 'DD HH:mm:ss').totalMilliseconds)
      .toBe(TimeSpan.from(1, 2, 3, 4).totalMilliseconds);
  });

  it.each([
    ['12:00 AM', 'hh:mm A', 0],
    ['12:00 PM', 'hh:mm A', 12],
    ['1:00 am', 'h:mm a', 1],
    ['1:00 pm', 'h:mm a', 13],
    ['11:00 PM', 'h:mm A', 23],
    ['pm 01:00', 'a hh:mm', 13],
  ])('converts %s using %s', (input, format, hours) => {
    expect(TimeSpan.parse(input, format).totalMilliseconds)
      .toBe(TimeSpan.fromHours(hours).totalMilliseconds);
  });

  it('tries formats in order and supports spreading a format array', () => {
    const formats = ['HH:mm:ss', 'HH:mm'];
    expect(TimeSpan.parse('01:30', ...formats).totalMinutes).toBe(90);
    expect(TimeSpan.parse('01:02', 'HH:mm', 'mm:ss').totalSeconds).toBe(3720);
    // A lexical match with out-of-range components must also fall through.
    expect(TimeSpan.parse('25:01', 'HH:mm', 'mm:ss').totalSeconds).toBe(1501);
  });

  it('supports bracket literals and treats regex punctuation literally', () => {
    expect(TimeSpan.parse('1 day(s) 02h+03m.004', 'D[ day(s) ]HH[h+]mm[m.]SSS').totalMilliseconds)
      .toBe(TimeSpan.from(1, 2, 3, 0, 4).totalMilliseconds);
    expect(TimeSpan.parse('01.02', 'mm.ss').totalMilliseconds).toBe(62000);
    expect(() => TimeSpan.parse('01x02', 'mm.ss')).toThrow();
  });

  it('applies a leading minus to the entire duration and defaults missing components to zero', () => {
    expect(TimeSpan.parse('-1 02:03:04.005', 'D HH:mm:ss.sss').totalMilliseconds)
      .toBe(-TimeSpan.from(1, 2, 3, 4, 5).totalMilliseconds);
    expect(TimeSpan.parse('-1 PM', 'h A').totalHours).toBe(-13);
    expect(TimeSpan.parse('15', 'mm').totalMinutes).toBe(15);
  });

  it.each([
    ['24:00', 'HH:mm'], ['23:60', 'HH:mm'], ['60', 'ss'],
    ['00 AM', 'hh A'], ['13 PM', 'hh A'], ['01 pm', 'hh A'], ['01 PM', 'hh a'],
    ['1', 'HH'], ['1', 'DD'], ['1', 'mm'], ['1', 'ss'],
    [' 01:02', 'HH:mm'], ['01:02 ', 'HH:mm'], ['01:02\n', 'HH:mm'],
    ['01:-02', 'HH:mm'], ['+01:02', 'HH:mm'], ['01:02x', 'HH:mm'],
  ])('rejects input %j for %s', (input, format) => {
    expect(() => TimeSpan.parse(input, format)).toThrow();
  });

  it.each(['', '[literal]', '[unclosed', 'HH]', 'YYYY', 'SS', 'HH H', 'D d',
    'SSS sss', 'h', 'hh:mm', 'HH A', 'A', 'h A a'])('rejects invalid format %j', (format) => {
    expect(() => TimeSpan.parse('01', format)).toThrow();
    expect(() => TimeSpan.parse('01', 'HH', format)).toThrow();
  });

  it('preserves safe integer boundaries and rejects overflow', () => {
    for (const value of [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]) {
      const duration = new TimeSpan(value);
      const input = `${value < 0 ? '-' : ''}${Math.abs(duration.days)} `
        + `${Math.abs(duration.hours)}:${Math.abs(duration.minutes)}:${Math.abs(duration.seconds)}.`
        + `${Math.abs(duration.milliseconds).toString().padStart(3, '0')}`;
      expect(TimeSpan.parse(input, 'D H:m:s.SSS').totalMilliseconds).toBe(value);
    }
    expect(() => TimeSpan.parse('104249991374 7:36:31.992', 'D H:m:s.SSS')).toThrow(RangeError);
    expect(() => TimeSpan.parse('999999999999999999999', 'D')).toThrow(RangeError);
  });

  it('preserves default parsing when no formats are supplied', () => {
    expect(TimeSpan.parse('1.2:3:4', ...[]).totalMilliseconds)
      .toBe(TimeSpan.from(1, 2, 3, 4).totalMilliseconds);
    expect(TimeSpan.parse('25:00:00').totalHours).toBe(25);
    expect(() => TimeSpan.parse('1.2:3:4', 'HH:mm:ss')).toThrow();
  });
});
