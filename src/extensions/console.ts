import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Console {
    /**
     * Logs formatted text using browser console CSS styling.
     *
     * String arguments are printed normally.  
     * Object arguments render styled text using %c.
     */
    styled(...args: ConsoleFormatPart[]): void;

    /**
     * Logs text to the console using the specified text color.
     */
    color(text: unknown, color: string): void;

    /**
     * Logs text to the console in red color.
     */
    red(text: unknown): void;
  }
}

type ConsoleFormatPart =
  | string
  | null
  | undefined
  | {
    text?: string | null;
    [style: string]: unknown;
  };

function styled(...args: ConsoleFormatPart[]): void {
  if (args.length === 0) {
    return;
  }

  let template = "";
  const styles: string[] = [];

  for (const arg of args) {
    if (typeof arg === "string") {
      template += arg;
      continue;
    }

    if (!arg) {
      continue;
    }

    template += "%c";
    template += arg.text ?? "";

    const css = Object.entries(arg)
      .filter(([key]) => key !== "text")
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");

    styles.push(css);
  }

  console.log(template, ...styles);
};

function color(text: unknown, color: string): void {
  console.log(`%c${String(text)}`, `color: ${color}`);
}

function red(text: unknown): void {
  console.color(text, "red");
}

definePropertyIfAbsent(console, 'styled', styled);
definePropertyIfAbsent(console, 'color', color);
definePropertyIfAbsent(console, 'red', red);