const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Esempio server HTTP\n');
});

const callback = () => {
  const address = server.address().address;
  const port = server.address().port;
  console.log(`
  Server avviato all'indirizzo http://${address}:${port}
  `);
}

server
  .listen(
    8000, 
    '127.0.0.1',
    callback
  )
