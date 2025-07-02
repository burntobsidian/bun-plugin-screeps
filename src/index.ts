export { screepsPlugin } from "./plugin";
export { readConfig, collectCode, uploadCode, type CodeList, type ScreepsConfig } from "./helpers";

/* Re-export CLI’s main function for programmatic use */
export { uploadFromDist } from "./cli";
