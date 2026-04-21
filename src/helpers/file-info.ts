export namespace FileInfo {
  const compressionExts = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.zst'];

  /**
   * Splits a filename into its name and extension parts.
   * Handles filenames starting with a dot (e.g., ".gitignore") correctly by treating them as having no extension.
   * @param filename The full filename.
   * @returns A tuple containing the name part and the extension part (e.g., `['document', '.txt']`).
   */
  export function splitName(filename: string): [string, string] {
    const index = filename.lastIndexOf('.');
    if (index > 0) {
      const namePart = filename.substring(0, index);
      const extPart = filename.substring(index);
      return [namePart, extPart];
    }
    return [filename, ''];
  }

  /**
   * Gets the name part of a filename, without the extension.
   * @param filename The full filename.
   * @returns The name part of the file.
   */
  export function getBaseName(filename: string) {
    const [name, _] = splitName(filename);
    return name;
  }

  /**
   * Gets the extension part of a filename, including the leading dot.
   * @param filename The full filename.
   * @returns The extension (e.g., ".txt") or an empty string if not found.
   */
  export function getExtension(filename: string) {
    const [_, ext] = splitName(filename);
    return ext;
  }

  /**
   * Replaces characters in a string that are illegal or problematic in file systems.
   * @param name The string to sanitize.
   * @returns A sanitized string suitable for use as a filename.
   */
  export function replaceIllegalChars(name: string) {
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
  }

  /**
   * Checks if a filename corresponds to a common compression file format.
   * @param filename The filename to check.
   * @returns `true` if the filename has a compression extension, otherwise `false`.
   */
  export function isCompression(filename: string) {
    const ext = getExtension(filename);
    return compressionExts.some(m => m.equalsIgnoreAsciiCase(ext));
  }
}