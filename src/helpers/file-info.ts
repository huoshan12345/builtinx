export interface FileInfo {
  /**
   * A list of common compression file extensions.
   */
  compressionExts: readonly string[];

  /**
   * Splits a filename into its name and extension parts.
   * Handles filenames starting with a dot (e.g., ".gitignore") correctly by treating them as having no extension.
   * @param filename The full filename.
   * @returns A tuple containing the name part and the extension part (e.g., `['document', '.txt']`).
   */
  splitName(filename: string): [string, string];

  /**
   * Gets the name part of a filename, without the extension.
   * @param filename The full filename.
   * @returns The name part of the file.
   */
  getBaseName(filename: string): string;

  /**
   * Gets the extension part of a filename, including the leading dot.
   * @param filename The full filename.
   * @returns The extension (e.g., ".txt") or an empty string if not found.
   */
  getExtension(filename: string): string;

  /**
   * Replaces characters in a string that are illegal or problematic in file systems.
   * @param name The string to sanitize.
   * @returns A sanitized string suitable for use as a filename.
   */
  replaceIllegalChars(name: string): string;

  /**
   * Checks if a filename corresponds to a common compression file format.
   * @param filename The filename to check.
   * @returns `true` if the filename has a compression extension, otherwise `false`.
   */
  isCompression(filename: string): boolean;
}

export const FileInfo: FileInfo = {
  compressionExts: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.zst'] as const,

  splitName(filename: string): [string, string] {
    const index = filename.lastIndexOf('.');
    if (index > 0) {
      const namePart = filename.substring(0, index);
      const extPart = filename.substring(index);
      return [namePart, extPart];
    }
    return [filename, ''];
  },

  getBaseName(filename: string) {
    const [name, _] = this.splitName(filename);
    return name;
  },

  getExtension(filename: string) {
    const [_, ext] = this.splitName(filename);
    return ext;
  },

  replaceIllegalChars(name: string) {
    return name
      .replaceAll('–', '-') // en dash to hyphen-minus
      .replaceAll(':', '-')
      .replaceAll('?', '-')
      .replaceAll('|', '-')
      .replaceAll('/', '_')
      .replaceAll('\\', '_') // backslash
      .replaceAll('"', "'")
      .replaceAll('*', '') // remove
      .replaceAll('<', '') // remove
      .replaceAll('>', '') // remove
      .trim();
  },

  isCompression(filename: string) {
    const ext = this.getExtension(filename);
    return this.compressionExts.some(m => m.equalsIgnoreAsciiCase(ext));
  }
}