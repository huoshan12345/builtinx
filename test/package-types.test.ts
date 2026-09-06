import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

test('published declarations support strict NodeNext consumers', () => {
  const root = resolve(import.meta.dirname, '..');
  const cacheRoot = join(root, 'node_modules', '.cache');
  const require = createRequire(import.meta.url);
  const compiler = join(dirname(require.resolve('typescript/package.json')), 'bin', 'tsc');
  mkdirSync(cacheRoot, { recursive: true });
  const temporary = mkdtempSync(join(cacheRoot, 'builtinx-nodenext-'));

  function compile(args: string[]): void {
    const result = spawnSync(process.execPath, [compiler, ...args], {
      cwd: root,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 30_000,
    });
    if (result.error) {
      throw result.error;
    }
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  }

  try {
    compile(['-p', 'tsconfig.build.json', '--outDir', join(temporary, 'dist')]);
    writeFileSync(join(temporary, 'package.json'), JSON.stringify({ type: 'module' }));
    writeFileSync(join(temporary, 'consumer.ts'), [
      "import { BuiltinX, MutationObserverOptions } from './dist/index.js';",
      "import './dist/dom.js';",
      "const node = document.createElement('div');",
      'const text: string = BuiltinX.Node.ownText(node);',
      'const same: HTMLDivElement = node.setVisible(true);',
      'const options = new MutationObserverOptions({ callOnStart: false });',
      'void [text, same, options];',
    ].join('\n'));
    const config = join(temporary, 'tsconfig.json');
    writeFileSync(config, JSON.stringify({
      compilerOptions: {
        target: 'ES2021',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
        lib: ['ES2021', 'DOM', 'DOM.Iterable'],
      },
      files: ['consumer.ts'],
    }, null, 2));
    compile(['-p', config]);
  } finally {
    if (dirname(temporary) === cacheRoot) {
      rmSync(temporary, { recursive: true, force: true });
    }
  }
}, 30_000);
