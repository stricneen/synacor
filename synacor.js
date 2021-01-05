const fs = require('fs');
const path = require('path');

const readfile = (fn) => {
    const fp = path.join(__dirname, `./${fn}`);
    return fs.readFileSync(fp);
}


const file = readfile('challenge.bin');
   