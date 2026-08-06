import fs from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import dts from "vite-plugin-dts";

const arrayBufferPattern =
  /\.(png|svg|wav|py|txt|glsl)$|(^|\/)builtins\/defaultJavascript\.js$/;
const VIRTUAL_PREFIX = "virtual:arraybuffer:";

function arrayBufferPlugin(): Plugin {
  return {
    name: "array-buffer-plugin",
    enforce: "pre",
    resolveId(id, importer) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return id;
      }
      if (arrayBufferPattern.test(id)) {
        const baseDir = importer ? path.dirname(importer) : process.cwd();
        const resolvedPath = path.resolve(baseDir, id);
        return VIRTUAL_PREFIX + resolvedPath;
      }
      return null;
    },
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const filePath = id.slice(VIRTUAL_PREFIX.length);
        const bytes = fs.readFileSync(filePath);
        const code = `export default new Uint8Array([${bytes.join(",")}])`;
        return code;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    arrayBufferPlugin(),
    dts({
      entryRoot: "src",
      outDir: "dist/types",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.worker.js"],
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ScratchStorage",
    },
    rollupOptions: {
      output: [
        {
          format: "es",
          dir: "dist/web",
          entryFileNames: "scratch-storage.mjs",
        },
        {
          format: "cjs",
          dir: "dist/node",
          entryFileNames: "scratch-storage.js",
        },
        {
          format: "umd",
          dir: "dist/web",
          entryFileNames: "scratch-storage.min.js",
          name: "ScratchStorage",
        },
      ],
      external: ["js-md5", "minilog"],
    },
  },
});
