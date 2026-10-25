import { expectTypeOf } from 'vitest';

describe('Element.trimBrs', () => {
  const cases = [
    ['', ''],
    ['<br>\n<br>', ''],
    ['<!--a--><br>\n<!--b-->', '<!--a--><!--b-->'],
    ['<!--a--><br>\n<!--b-->hello<!--c-->\n<br><!--d-->', '<!--a--><!--b-->hello<!--c--><!--d-->'],
    ['<br>hello<br>world<br>', 'hello<br>world'],
    ['<br><span><br>hello<br></span><br>', '<span><br>hello<br></span>'],
    [' <br>hello<br>\t', ' <br>hello<br>\t'],
    ['<!--a-->hello<!--b-->', '<!--a-->hello<!--b-->'],
  ];

  it.each(cases)('trims %j while preserving content and comments', (input, expected) => {
    const element = document.createElement('div');
    element.innerHTML = input;
    const comments = Array.from(element.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);

    expect(element.trimBrs()).toBe(element);
    expect(element.innerHTML).toBe(expected);
    expect(comments.every(node => node.parentNode === element)).toBe(true);
    expect(element.trimBrs().innerHTML).toBe(expected);
    expectTypeOf(element.trimBrs()).toEqualTypeOf<HTMLDivElement>();
  });

  it('stops at empty Text nodes', () => {
    const element = document.createElement('div');
    const empty = document.createTextNode('');
    element.append(empty, document.createElement('br'), 'hello');
    element.trimBrs();
    expect(element.firstChild).toBe(empty);
    expect(element.childNodes[1].nodeName).toBe('BR');
  });

  it('does not treat XML BR as an HTML break', () => {
    const element = document.createElement('div');
    const xmlBreak = document.createElementNS(null, 'BR');
    element.append(xmlBreak);
    element.trimBrs();
    expect(element.firstChild).toBe(xmlBreak);
  });

  it('supports iframe elements through the static method', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    try {
      const element = frame.contentDocument!.createElement('div');
      element.innerHTML = '<!--a--><br>hello\n<br><!--b-->';
      expect(element.trimBrs).toBeUndefined();
      expect(BuiltinX.Element.trimBrs(element)).toBe(element);
      expect(element.innerHTML).toBe('<!--a-->hello\n<!--b-->');
      expectTypeOf(BuiltinX.Element.trimBrs(element)).toEqualTypeOf<HTMLDivElement>();
    } finally {
      frame.remove();
    }
  });
});
