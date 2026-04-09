const { spawn } = require('child_process');
const path = require('path');

const projectName = 'dfashion-frontend';
const proxyConfig = 'proxy.conf.json';

const rawArgs = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--project' || arg === '-p') {
    i++; // skip the next value
    continue;
  }
  if (arg.startsWith('--project=')) {
    continue;
  }
  filteredArgs.push(arg);
}

const ngArgs = ['serve', projectName, '--proxy-config', proxyConfig, ...filteredArgs];
const ngPath = path.join('node_modules', '.bin', 'ng');
const command = process.platform === 'win32' ? `${ngPath}.cmd` : ngPath;

const child = spawn(command, ngArgs, {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
