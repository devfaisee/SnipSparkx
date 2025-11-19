const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css',
    dest: 'public/vendor/atom-one-dark.min.css'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
    dest: 'public/vendor/highlight.min.js'
  }
];

files.forEach(file => {
  const fileStream = fs.createWriteStream(path.join(__dirname, file.dest));
  https.get(file.url, (response) => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file.dest}`);
    });
  }).on('error', (err) => {
    fs.unlink(path.join(__dirname, file.dest));
    console.error(`Error downloading ${file.dest}: ${err.message}`);
  });
});
