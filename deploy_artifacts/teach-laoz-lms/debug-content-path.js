
const http = require('http');

const path = 'teach-laoz-curso-dibujo-ninos/modulos/modulo_0/0.1_introduccion.md';
const url = `http://localhost:3000/api/content/${path}`;

console.log(`Fetching: ${url}`);

http.get(url, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`BODY: ${data}`);
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
