import { describe, it, expect } from 'vitest';

// We assume a test setup where the 'builtinx' library is loaded,
// making the 'BuiltinX' object globally available.

describe('BuiltinX.Color', () => {
  describe('rgbToHex', () => {
    it('should convert basic RGB values to a hex string', () => {
      expect(BuiltinX.Color.rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(BuiltinX.Color.rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(BuiltinX.Color.rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(BuiltinX.Color.rgbToHex(16, 17, 18)).toBe('#101112');
    });

    it('should handle the toUpperCase parameter', () => {
      expect(BuiltinX.Color.rgbToHex(255, 0, 0, true)).toBe('#FF0000');
      expect(BuiltinX.Color.rgbToHex(10, 11, 12, true)).toBe('#0A0B0C');
    });

    it('should clamp values outside the 0-255 range', () => {
      expect(BuiltinX.Color.rgbToHex(300, -10, 255)).toBe('#ff00ff');
      expect(BuiltinX.Color.rgbToHex(0, 500, -20)).toBe('#00ff00');
    });

    it('should handle floating point numbers by truncating them', () => {
      expect(BuiltinX.Color.rgbToHex(255.9, 0.1, 15.5)).toBe('#ff000f');
    });
  });

  describe('hexToRgb', () => {
    it('should convert a full hex string to an RGB object', () => {
      expect(BuiltinX.Color.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(BuiltinX.Color.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert a hex string without a hash to an RGB object', () => {
      expect(BuiltinX.Color.hexToRgb('0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should convert a shorthand hex string to an RGB object', () => {
      expect(BuiltinX.Color.hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(BuiltinX.Color.hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert a shorthand hex string without a hash to an RGB object', () => {
      expect(BuiltinX.Color.hexToRgb('00f')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle mixed case hex strings', () => {
      expect(BuiltinX.Color.hexToRgb('#fF00aA')).toEqual({ r: 255, g: 0, b: 170 });
      expect(BuiltinX.Color.hexToRgb('F0a')).toEqual({ r: 255, g: 0, b: 170 });
    });

    it('should return null for invalid hex strings', () => {
      expect(BuiltinX.Color.hexToRgb('#12345')).toBeNull();
      expect(BuiltinX.Color.hexToRgb('1234')).toBeNull();
      expect(BuiltinX.Color.hexToRgb('#f0g')).toBeNull();
      expect(BuiltinX.Color.hexToRgb('invalid')).toBeNull();
      expect(BuiltinX.Color.hexToRgb('')).toBeNull();
    });

    it('should return null for non-string inputs', () => {
      expect(BuiltinX.Color.hexToRgb(null as any)).toBeNull();
      expect(BuiltinX.Color.hexToRgb(undefined as any)).toBeNull();
      expect(BuiltinX.Color.hexToRgb(123 as any)).toBeNull();
    });
  });
});