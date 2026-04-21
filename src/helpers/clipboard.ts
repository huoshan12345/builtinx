export namespace Clipboard {
  /**
   * Asynchronously copies the specified string to the system clipboard.
   * @param str The string to copy.
   */
  export async function copy(str: string): Promise<void> {
    await navigator.clipboard.writeText(str);
  }
}