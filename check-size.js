const fs = require('fs');
const stats = fs.statSync('public/pdfs/jejak-balak.pdf');
console.log('File size:', stats.size);
