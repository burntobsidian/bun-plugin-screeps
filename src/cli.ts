#!/usr/bin/env bun
import { readConfig, collectCode, uploadCode } from "./helpers";

export async function uploadFromDist(distMain = "dist/main.js", configFile = "./screeps.json") {
	const cfg = await readConfig(configFile);
	const code = await collectCode(distMain);
	await uploadCode(cfg, code);
}

if (import.meta.main) {
	const mainJs = Bun.argv[2] ?? "dist/main.js";
	const configPath = Bun.argv[3] ?? "./screeps.json";
	await uploadFromDist(mainJs, configPath);
}
