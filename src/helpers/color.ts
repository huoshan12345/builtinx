export namespace Color {
  /**
   * Converts RGB color values to a hexadecimal string.
   * @param r The red value (0-255).
   * @param g The green value (0-255).
   * @param b The blue value (0-255).
   * @param toUpperCase Whether to convert the resulting hex string to uppercase. Defaults to false.
   * @returns The hexadecimal color string (e.g., "#ff0000").
   */
  export function rgbToHex(r: number, g: number, b: number, toUpperCase: boolean = false): string {
    const hex = "#" + [r, g, b].map(toHex).join("");
    return toUpperCase ? hex.toUpperCase() : hex;

    function toHex(c: number) {
      // Clamp the value between 0 and 255 to ensure validity
      const clamped = Math.max(0, Math.min(255, Math.trunc(c)));
      return clamped.toString(16).padStart(2, "0");
    }
  }

  /**
   * Converts a HEX color string to an RGB object.
   * @param hex The hex color string (e.g., "#RRGGBB", "RRGGBB", "#RGB", "RGB").
   * @returns An object with r, g, b properties, or null if the hex string is invalid.
   */
  export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex || typeof hex !== 'string') {
      return null;
    }

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  }
}
