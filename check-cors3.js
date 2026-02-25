const https = require('https');
https.get('https://jejak-balak-ayu-welirang-z-library-sk-1lib-sk-z-lib-sk.tiiny.site/Jejak-Balak-Ayu-Welirang-z-library-sk%2C-1lib-sk%2C-z-lib-sk.pdf', (res) => {
  console.log(res.statusCode);
  console.log(res.headers);
});
