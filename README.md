# bun-plugin-screeps

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Usage

```ts
import { screepsPlugin } from "bun-plugin-screeps/plugin";

await Bun.build({
	entrypoints: ["src/index.ts"],
	outdir: "dist",
	sourcemap: "external",
	plugins: [screepsPlugin()],
});
```

This project was created using `bun init` in bun v1.2.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
