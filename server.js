const express = require('express');
const dns = require('dns');
const fs = require('fs');
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;
//const dnsNames = fs.readFileSync('/config/dns_names.txt', 'utf-8').split('\n');
//const ipToLocationMap = JSON.parse(fs.readFileSync('/config/ip_to_location_map.json', 'utf-8'));
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
        return new Promise((resolve, reject) => {
          dns.lookup(name, (err, address, family) => {
            if (err) {
              reject(err);
            } else {
              const location = ipToLocationMap[address] || 'location unknown';
              resolve({ name, address, location });
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
    dns.lookup(name, (err, address, family) => {
      if (err) {
        console.log(`Error querying ${name}: ${err}`);
      } else {
        const location = ipToLocationMap[address] || 'location unknown';
        console.log(`${name} resolves to ${address} (${location})`);
      }
    });
  });
}, 30000);

app.listen(port, () => {
  console.log(`DNS Query Web App listening at http://localhost:${port}`);
});
