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
esbuild
.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/bundle.esm.mjs",
  outExtension: { ".js": ".mjs" },
  tsconfig: "./tsconfig.json",
  platform: "browser",
  format: "esm",
  target: ["es6"],
  platform: "neutral",
  sourcemap: true,
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
})
.catch((error) => {
  console.error(error);
  process.exit(1);
});

// Copy package.json removing unnecesary properties
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

delete packageJson.scripts;
delete packageJson.devDependencies;

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2), "utf8");

// Copy other files
fs.copyFileSync("README.md", "dist/README.md");
fs.copyFileSync("LICENSE.md", "dist/LICENSE.md");
