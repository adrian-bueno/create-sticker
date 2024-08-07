const fs = require('fs');
const esbuild = require('esbuild');
const { execSync } = require('child_process');

fs.rmSync("dist", { recursive: true, force: true });

// Run TypeScript compiler to generate declaration files
execSync('npx tsc');

// Browser bundle
esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.iife.js',
  platform: 'browser',
  format: 'iife',
  globalName: 'CreateSticker',
  target: ['es6'],
  sourcemap: true,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

// ESM bundle
esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.esm.js',
  platform: 'browser',
  format: 'esm',
  target: ['es6'],
  sourcemap: true,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
