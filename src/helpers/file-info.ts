export namespace FileInfo {
  const compressionExts = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.zst'];

  export function splitName(filename: string): [string, string] {
    const index = filename.lastIndexOf('.');
    if (index > 0) {
      const namePart = filename.substring(0, index);
      const extPart = filename.substring(index);
      return [namePart, extPart];
    }
    return [filename, ""];
  }

  export function getName(filename: string) {
    const [name, _] = splitName(filename);
    return name;
  }

  export function getExt(filename: string) {
    const [_, ext] = splitName(filename);
    return ext;
  }

  export function replaceIllegalChars(title: string) {
    return title
      .replaceAll('–', '-') // these two are different characters
      .replaceAll('?', '-')
      .replaceAll(':', '-')
      .replaceAll('|', '-')
      .replaceAll('"', "'")
      .replaceAll('/', '_')
      .trim();
  }

  export function isCompression(filename: string) {
    const ext = getExt(filename);
    return compressionExts.some(m => m.equalsIgnoreAsciiCase(ext));
  }
}