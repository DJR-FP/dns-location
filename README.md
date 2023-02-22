# dns-location


#testing docker run -p 3000:3000 -v ./config:/app/config my-appv9

docker build -t my-appv9 .

Edit these files with your own details

dns_names.txt

dns_server.txt

ip_to_location_map.json

touch ip_to_location_map.json dns_server.txt dns_names.txt

echo "192.168.100.125" > dns_server.txt

echo "floatingip.testlab.com" > dns_names.txt

example json ip_to_location_map.json
{
  "151.101.0.81": "Data center 1",
  "151.101.192.81": "Data center 2"
}
