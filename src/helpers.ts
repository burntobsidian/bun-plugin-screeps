import { z } from "zod";
import { ScreepsAPI } from "screeps-api";
import git from "git-rev-sync";
import path from "node:path";
import crypto from "node:crypto";

export const ScreepsConfigSchema = z.object({
	token: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
	protocol: z.enum(["http", "https"]).default("https"),
	hostname: z.string().default("screeps.com"),
	port: z.number().default(443),
	path: z.string().default("/"),
	branch: z.union([z.literal("auto"), z.string()]).default("auto"),
});
export type ScreepsConfig = z.infer<typeof ScreepsConfigSchema>;

export async function readConfig(file = "./screeps.ci.json") {
	const exists = await Bun.file(file).exists();
	const json = exists ? await Bun.file(file).json() : {};
	const cfg = ScreepsConfigSchema.parse({
		...json,
		token: process.env.SCREEPS_TOKEN ?? json.token,
		email: process.env.SCREEPS_EMAIL ?? json.email,
		password: process.env.SCREEPS_PASSWORD ?? json.password,
	});
	return cfg;
}

export interface CodeList {
	[key: string]: string | { binary: string };
}

export async function collectCode(mainOutputFile: string): Promise<CodeList> {
	const base = path.dirname(mainOutputFile);
	const code: CodeList = {};

	const glob = new Bun.Glob("*.{js,wasm}");
	for await (const rel of glob.scan({ cwd: base })) {
		const full = path.join(base, rel);

		if (rel.endsWith(".js")) {
			code[rel.replace(/\.js$/i, "")] = await Bun.file(full).text();
		} else {
			const buf = await Bun.file(full).arrayBuffer();
			code[rel] = { binary: Buffer.from(buf).toString("base64") };
		}
	}

	return code;
}

export async function uploadCode(cfg: ScreepsConfig, code: CodeList): Promise<void> {
	const branch = cfg.branch === "auto" ? git.branch() : cfg.branch;

	const api = new ScreepsAPI({
		protocol: cfg.protocol,
		hostname: cfg.hostname,
		port: cfg.port,
		path: cfg.path,
		token: cfg.token,
	});

	if (!cfg.token) {
		if (!cfg.email || !cfg.password) {
			throw new Error("uploadCode: supply either cfg.token OR cfg.email + cfg.password.");
		}
		await api.auth(cfg.email, cfg.password);
	}

	const payload = JSON.stringify(code);
	const _hash = crypto.createHash("md5").update(payload).digest("hex");

	const { list } = await api.raw.user.branches();
	const exists = list.some((b: any) => b.branch === branch);

	if (exists) {
		await api.code.set(branch, code, _hash);
	} else {
		await api.raw.user.cloneBranch("", branch, code);
	}

	console.log(`✅  Uploaded to Screeps (“${branch}”).`);
}
