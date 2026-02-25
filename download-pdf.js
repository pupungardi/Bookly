const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://z-lib.sk/dl/dnW112ogm4'; // The download_location from the URL

const dest = path.join(__dirname, 'public', 'pdfs', 'jejak-balak.pdf');

// Ensure directory exists
fs.mkdirSync(path.dirname(dest), { recursive: true });

const file = fs.createWriteStream(dest);

https.get(url, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed.');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed.');
    });
  }
}).on('error', (err) => {
  fs.unlink(dest, () => {});
  console.error('Error downloading file:', err.message);
});
