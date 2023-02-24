# dns-location

#UPDATED NEEDED for latest version with dns fix and error checking# 

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

Logging

docker exec <container_name> cat /app/dns_query_log.txt

docker exec <container_name> cat /app/dns_query_log.txt > dns_query_log.txt

--env DNS_SERVER=192.168.50.148 
