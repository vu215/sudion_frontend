import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const targetDirName = process.argv[2] || ".next";
const nextDir = join(process.cwd(), targetDirName);

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log(`Removed stale ${targetDirName} output.`);
}
