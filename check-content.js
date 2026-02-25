const fs = require('fs');
const content = fs.readFileSync('public/pdfs/jejak-balak.pdf', 'utf8');
console.log(content.substring(0, 500));
