import type { BunPlugin, Loader } from "bun";

export function screepsPlugin(): BunPlugin {
	return {
		name: "screeps-build-only",
		setup(builder) {
			builder.onResolve({ filter: /\.map$/ }, ({ path }) => ({ path }));
			builder.onLoad({ filter: /\.map$/ }, async ({ path }) => {
				const raw = await Bun.file(path).text();
				const json = JSON.parse(raw);
				delete json.sourcesContent;

				const contents = "module.exports = " + JSON.stringify(json) + ";\n";

				return {
					loader: "js" satisfies Loader,
					contents,
				};
			});
		},
	};
}
