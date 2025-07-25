const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());

const indexPath = path.join(process.cwd(), 'dist', 'index.js');
console.log('Looking for index.js at:', indexPath);

if (fs.existsSync(indexPath)) {
  console.log('Starting application...');
  const { MentraSpotifyApp } = require(indexPath);
  const app = new MentraSpotifyApp();
  app.initialize().then(() => {
    app.startAuthServer();
  }).catch(error => {
    console.error('Failed to start app:', error);
    process.exit(1);
  });
} else {
  console.error('index.js not found!');
  process.exit(1);
}
