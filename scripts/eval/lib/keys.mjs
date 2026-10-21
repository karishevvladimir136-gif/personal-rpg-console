// Reads one provider key from .env.local, else from the cloud environment's APP_<name> variable. The shell's own
// <name> is never read (fix S3-pre E-4c): an ANTHROPIC_API_KEY exported in the shell can make Claude Code itself bill
// that key, and a stray export would silently override the app's key. The value is returned to the caller only; it is
// never printed or written anywhere.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function providerKey(name) {
  const file = join(root, ".env.local");
  if (existsSync(file)) {
    const pattern = new RegExp(`^\\s*${name}\\s*=`);
    const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => pattern.test(entry));
    const value = line ? line.replace(pattern, "").trim().replace(/^["']|["']$/g, "").trim() : "";
    if (value) return value;
  }
  const cloud = process.env[`APP_${name}`]?.trim();
  return cloud || null;
}
