const https = require('https');
https.get('https://jejak-balak-ayu-welirang-z-library-sk-1lib-sk-z-lib-sk.tiiny.site/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});
