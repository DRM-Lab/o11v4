Tested on **Ubuntu 20-23**

## Prerequisites

### 1. Create the Required Directory
Run the following command to create the necessary directory:
```sh
mkdir -p /home/o11
cd /home/o11
```
### 2. Install Nodejs/NPM

Run the following command to install the necessary software if you want to use nodejs:
```sh
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2
npm install express
```
## Setting Up & Starting the License Server Proxy

open the server file and add in your servers ip address to the ipAddress veriable then save

Run the following commands to set up and start the license server:
```sh
## if using nodejs
pm2 start server.js --name licserver --silent

## if using python
pm2 start server.py --name licserver --interpreter python3

then

pm2 startup
pm2 save

nohup ./run.sh > /dev/null 2>&1 &
```
