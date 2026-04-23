export interface Clipboard {
  /**
   * Asynchronously copies the specified string to the system clipboard.
   * @param str The string to copy.
   */  
  copy(str: string): Promise<string>;
}

export const Clipboard: Clipboard = {
  async copy(str: string): Promise<string> {
    await navigator.clipboard.writeText(str);
    return str;
  },
};