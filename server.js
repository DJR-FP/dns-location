const express = require('express');
const dns = require('dns');
const fs = require('fs');
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;
const logFilePath = 'dns_query_log.txt';
fs.writeFileSync(logFilePath, '');
const dnsNames = fs.readFileSync('config/dns_names.txt', 'utf-8').split('\n');
const ipToLocationMap = JSON.parse(fs.readFileSync('config/ip_to_location_map.json', 'utf-8'));



const path = require('path');

// ...

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  res.write('<html>');
//  res.write('<div class="logo"></div>');
  res.write('<head><title>DNS Location FullProxy Ltd</title><link rel="stylesheet" href="style.css"><meta http-equiv="Refresh" content="5"></head>');
  res.write('<body>');
  res.write('<div class="logo"></div>');
 // res.write('<h1>DNS Location</h1>');
  res.write('<h1><span class="text">DNS Location Tracker</h1></span>');
  // Get the default DNS server IP and add it to the response/
  //changed this
  //const dnsServerIp = dns.getServers()[0];
 //
 const dnsServerIp = fs.readFileSync('config/dns_server.txt', 'utf-8').trim();
  res.write(`<p>Using DNS server: ${dnsServerIp}</p>`);

  try {
   const results = await Promise.all(
  dnsNames.map((name) => {
    return new Promise((resolve) => {
      dns.lookup(name, { all: true, family: 4, server: dnsServerIp }, (err, addresses) => {
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

const dnsServerIp = fs.readFileSync('config/dns_server.txt', 'utf-8').trim();

setInterval(() => {
  console.log(`Querying DNS names: ${dnsNames}`);
  dnsNames.forEach((name) => {
    dns.lookup(name, { all: true, family: 4, server: dnsServerIp }, (err, addresses) => {
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
