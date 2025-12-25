const https = require('https');

const url = 'https://major-berries-win.loca.lt/api';

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
    res.on('data', (d) => process.stdout.write(d));
}).on('error', (e) => {
    console.error(e);
});
