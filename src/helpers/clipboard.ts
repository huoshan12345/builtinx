export const Clipboard = {
  /**
   * Asynchronously copies the specified string to the system clipboard.
   * @param str The string to copy.
   */
  async copy(str: string): Promise<string> {
    await navigator.clipboard.writeText(str);
    return str;
  },
}