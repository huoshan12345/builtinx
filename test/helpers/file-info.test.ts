// Assuming 'BuiltinX' is globally available
describe('BuiltinX.FileInfo', () => {
  describe('splitName', () => {
    it('should split a standard filename', () => {
      expect(BuiltinX.FileInfo.splitName('document.txt')).toEqual(['document', '.txt']);
    });

    it('should handle filenames with multiple dots', () => {
      expect(BuiltinX.FileInfo.splitName('archive.tar.gz')).toEqual(['archive.tar', '.gz']);
    });

    it('should treat dotfiles as having no extension', () => {
      expect(BuiltinX.FileInfo.splitName('.gitignore')).toEqual(['.gitignore', '']);
    });

    it('should handle filenames with no extension', () => {
      expect(BuiltinX.FileInfo.splitName('myfile')).toEqual(['myfile', '']);
    });

    it('should handle empty strings', () => {
      expect(BuiltinX.FileInfo.splitName('')).toEqual(['', '']);
    });
  });

  describe('getBaseName', () => {
    it('should return the name part of a standard filename', () => {
      expect(BuiltinX.FileInfo.getBaseName('document.txt')).toBe('document');
    });

    it('should return the full name for dotfiles', () => {
      expect(BuiltinX.FileInfo.getBaseName('.bashrc')).toBe('.bashrc');
    });
  });

  describe('getExtension', () => {
    it('should return the extension of a standard filename', () => {
      expect(BuiltinX.FileInfo.getExtension('image.jpeg')).toBe('.jpeg');
    });

    it('should return the last extension for files with multiple dots', () => {
      expect(BuiltinX.FileInfo.getExtension('archive.tar.gz')).toBe('.gz');
    });

    it('should return an empty string for files with no extension', () => {
      expect(BuiltinX.FileInfo.getExtension('README')).toBe('');
    });

    it('should return an empty string for dotfiles', () => {
      expect(BuiltinX.FileInfo.getExtension('.config')).toBe('');
    });
  });

  describe('replaceIllegalChars', () => {
    it('should replace common illegal characters', () => {
      const input = 'my:file?|is"awesome/and\\great';
      const expected = 'my-file--is\'awesome_and_great';
      expect(BuiltinX.FileInfo.replaceIllegalChars(input)).toBe(expected);
    });

    it('should remove characters like *, <, >', () => {
      const input = 'a*b<c>d.txt';
      const expected = 'abcd.txt';
      expect(BuiltinX.FileInfo.replaceIllegalChars(input)).toBe(expected);
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '  spaced out file  ';
      const expected = 'spaced out file';
      expect(BuiltinX.FileInfo.replaceIllegalChars(input)).toBe(expected);
    });

    it('should replace en dash with hyphen-minus', () => {
      const input = 'long–dash';
      const expected = 'long-dash';
      expect(BuiltinX.FileInfo.replaceIllegalChars(input)).toBe(expected);
    });
  });

  describe('isCompression', () => {
    it('should return true for common compression formats', () => {
      expect(BuiltinX.FileInfo.isCompression('archive.zip')).toBe(true);
      expect(BuiltinX.FileInfo.isCompression('data.tar.gz')).toBe(true);
      expect(BuiltinX.FileInfo.isCompression('backup.rar')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(BuiltinX.FileInfo.isCompression('archive.ZIP')).toBe(true);
      expect(BuiltinX.FileInfo.isCompression('STUFF.7Z')).toBe(true);
    });

    it('should return false for non-compression formats', () => {
      expect(BuiltinX.FileInfo.isCompression('document.pdf')).toBe(false);
      expect(BuiltinX.FileInfo.isCompression('image.png')).toBe(false);
      expect(BuiltinX.FileInfo.isCompression('no_extension')).toBe(false);
    });
  });
});