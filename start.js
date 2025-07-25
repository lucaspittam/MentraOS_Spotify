const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync('.'));

const distPath = path.join(process.cwd(), 'dist');
console.log('Looking for dist at:', distPath);
console.log('Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('Dist contents:', fs.readdirSync(distPath));
}

const indexPath = path.join(distPath, 'index.js');
console.log('Looking for index.js at:', indexPath);
console.log('Index.js exists:', fs.existsSync(indexPath));

if (fs.existsSync(indexPath)) {
  console.log('Starting application...');
  require(indexPath);
} else {
  console.error('index.js not found!');
  process.exit(1);
}