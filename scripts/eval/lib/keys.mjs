// Reads one provider key from the environment or .env.local. The value is
// returned to the caller only; it is never printed or written anywhere.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function providerKey(name) {
  if (process.env[name]?.trim()) return process.env[name].trim();
  const file = join(root, ".env.local");
  if (!existsSync(file)) return null;
  const pattern = new RegExp(`^\\s*${name}\\s*=`);
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => pattern.test(entry));
  if (!line) return null;
  const value = line.replace(pattern, "").trim().replace(/^["']|["']$/g, "").trim();
  return value || null;
}
