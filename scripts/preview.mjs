import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
const address = "http://127.0.0.1:3000";
const next = "node_modules/next/dist/bin/next";

if (!existsSync(next)) {
  console.error(
    "The preview packages are not installed. Open this project in Codex and ask to install them.",
  );
  process.exitCode = 1;
} else {
  let alreadyRunning = false;
  try {
    const response = await fetch(address, {
      signal: AbortSignal.timeout(1500),
    });
    const html = await response.text();
    alreadyRunning =
      html.includes("Personal RPG Console") && /PHASE [01]/.test(html);
    if (!alreadyRunning)
      throw new Error("Port 3000 is being used by another application.");
  } catch (error) {
    if (error.message === "Port 3000 is being used by another application.") {
      console.error(
        error.message + " Ask Codex to start the preview on a free port.",
      );
      process.exit(1);
    }
  }

  console.log(`\nYour Personal RPG Console is at ${address}\nIsolated visual preview: ${address}/preview\n`);
  if (alreadyRunning) {
    console.log(
      "The preview is already running. Open the address above in your browser.",
    );
  } else {
    console.log(
      "Leave this window open while you explore. Close it when you are finished.\n",
    );
    const mode = existsSync(".next/BUILD_ID") ? "start" : "dev";
    const child = spawn(
      process.execPath,
      [next, mode, "--hostname", "127.0.0.1", "--port", "3000"],
      { cwd: root, stdio: "inherit" },
    );
    child.on("exit", (code) => {
      process.exitCode = code ?? 0;
    });
    process.on("SIGINT", () => child.kill("SIGINT"));
    process.on("SIGTERM", () => child.kill("SIGTERM"));
  }
}
