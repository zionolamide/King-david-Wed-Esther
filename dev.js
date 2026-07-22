// Override NODE_ENV BEFORE any Next.js code loads
process.env.NODE_ENV = "development";
// Also explicitly set via env object for child processes
const env = { ...process.env, NODE_ENV: "development" };

const { spawn } = require("child_process");
const child = spawn("npx.cmd", ["next", "dev"], {
  stdio: "inherit",
  cwd: __dirname,
  shell: true,
  env,
});
child.on("exit", (code) => process.exit(code));
