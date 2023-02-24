const express = require('express');
const dns = require('dns');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const dnsServerIp = process.env.DNS_SERVER || '127.0.0.11';
const dnsNames = fs.readFileSync('config/dns_names.txt', 'utf-8').split('\n');
const ipToLocationMap = JSON.parse(fs.readFileSync('config/ip_to_location_map.json', 'utf-8'));

const logFilePath = 'dns_query_log.txt';
fs.writeFileSync(logFilePath, '');

app.use(express.static('public'));

app.get('/', async (req, res) => {
  res.write('<html>');
  res.write('<head><title>DNS Location Tracker</title><link rel="stylesheet" href="style.css"></head>');
  res.write('<body>');
  res.write('<div class="logo"></div>');
  res.write('<h1>DNS Location Tracker</h1>');
  res.write(`<p>Using DNS server: ${dnsServerIp}</p>`);
  try {
    const results = await Promise.all(
      dnsNames.map((name) => {
        return new Promise((resolve) => {
          dns.lookup(name, { all: true, family: 4, server: { address: dnsServerIp, port: 53 } }, (err, addresses) => {
            if (err) {
              console.log(`Error querying ${name}: ${err}`);
              resolve({ name, address: '0.0.0.0', location: 'location unknown' });
            } else {
              const location = ipToLocationMap[addresses[0].address] || 'location unknown';
              resolve({ name, address: addresses[0].address, location });
            }
          });
        });
      })
    );

    results.forEach(({ name, address, location }) => {
      res.write(`<p>${name} resolves to ${address} (${location})</p>`);
    });
  } catch (err) {
    res.write(`<p>Error querying DNS names: ${err}</p>`);
  }
  res.write('</body>');
  res.write('</html>');
  res.end();
});

setInterval(() => {
  console.log(`Querying DNS names: ${dnsNames}`);
  dnsNames.forEach((name) => {
    dns.lookup(name, { all: true, family: 4, server: { address: dnsServerIp, port: 53 } }, (err, addresses) => {
      try {
        if (err) throw err;
        const location = ipToLocationMap[addresses[0].address] || 'location unknown';
        const logMessage = `${new Date().toISOString()} - ${name} resolves to ${addresses[0].address} (${location})\n`;
        console.log(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
      } catch (err) {
        const logMessage = `${new Date().toISOString()} - Error querying ${name}: ${err}\n`;
        console.log(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
        const address = '0.0.0.0';
        const location = ipToLocationMap[address] || 'location unknown';
        const defaultLogMessage = `${new Date().toISOString()} - ${name} resolves to ${address} (${location})\n`;
        console.log(defaultLogMessage);
        fs.appendFileSync(logFilePath, defaultLogMessage);
      }
    });
  });
}, 30000);

app.listen(port, () => {
  console.log(`DNS Query Web App listening at http://localhost:${port}`);
});
