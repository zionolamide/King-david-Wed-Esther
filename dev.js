process.env.NODE_ENV = "development";
const { spawn } = require("child_process");
const child = spawn("npx.cmd", ["next", "dev", "--port", "3000"], {
  stdio: "inherit",
  cwd: __dirname,
  shell: true,
  env: { ...process.env, NODE_ENV: "development" },
});
child.on("exit", (code) => process.exit(code));
