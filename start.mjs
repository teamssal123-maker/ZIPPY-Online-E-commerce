import { spawn } from 'node:child_process';
import process from 'node:process';
import readline from 'node:readline';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const services = [
  { name: 'API', color: '\x1b[36m', cmd: npmCmd, args: ['run', 'dev'], cwd: './backend' },
  { name: 'Admin', color: '\x1b[35m', cmd: npmCmd, args: ['run', 'dev:admin'], cwd: '.' },
  { name: 'Storefront', color: '\x1b[32m', cmd: npmCmd, args: ['run', 'dev'], cwd: '.' },
];

const children = [];

function killChildren() {
  for (const child of children) {
    if (child && !child.killed) {
      try {
        if (isWin) {
          spawn('taskkill', ['/pid', child.pid.toString(), '/T', '/F']);
        } else {
          child.kill('SIGTERM');
        }
      } catch {
        // ignore errors during cleanup
      }
    }
  }
}

process.on('SIGINT', () => {
  killChildren();
  process.exit(0);
});

process.on('SIGTERM', () => {
  killChildren();
  process.exit(0);
});

process.on('exit', () => {
  killChildren();
});

console.log('\x1b[1m\x1b[33m%s\x1b[0m', 'Starting Zippy services (API: 3001, Admin: 3002, Storefront: 3000)...');

for (const svc of services) {
  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWin,
    env: process.env,
  });

  children.push(child);

  const prefix = `${svc.color}[${svc.name}]\x1b[0m `;

  if (child.stdout) {
    const rlOut = readline.createInterface({ input: child.stdout });
    rlOut.on('line', (line) => console.log(prefix + line));
  }

  if (child.stderr) {
    const rlErr = readline.createInterface({ input: child.stderr });
    rlErr.on('line', (line) => console.error(prefix + line));
  }

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${prefix}exited with code ${code}`);
    }
  });
}
