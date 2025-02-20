const https = require('https');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const hostspath = '/etc/hosts';
const domain = 'lic.cryptolive.one';
const domain2 = 'lic.bitmaster.cc';
const ipAddress = '';
const portHttp = 80;
const portHttps = 443;

// Start Express Server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`Received POST request to ${req.url}`);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
    }
    next();
});

app.use('/', express.static('www'));

// Handle POST /lic requests
app.post('/lic', (req, res) => {
    console.log('Received POST /lic request');

    // Define the file path
    const filePath = path.join(__dirname, 'lic.cr');

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).send('File not found');
    }

    // Send the file as a response
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file');
        }
    });
});


// Generate self-signed certificates if they don't exist
const certPath = './certs';
const keyFile = `${certPath}/key.pem`;
const certFile = `${certPath}/cert.pem`;

if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true }); // Ensure the directory exists
}

if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
    exec(
        `openssl req -x509 -newkey rsa:2048 -keyout ${keyFile} -out ${certFile} -days 365 -nodes -subj "/CN=localhost"`,
        { stdio: 'inherit' } // Show output in console
    );
}

const options = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
};

// Start HTTP and HTTPS servers
[80, 5454].forEach(port => {
    http.createServer(app).listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
    });
});

https.createServer(options, app).listen(portHttps, (err) => {
    if (err) {
        console.error(`Error starting HTTPS server: ${err.message}`);
    } else{
    console.log(`HTTPS server running on port ${portHttps}`);
    }
});

// Function to update the /etc/hosts file
function updateHosts() {
    try {
        let content = fs.readFileSync(hostspath, 'utf8').split('\n');
        
        content = content.filter(line => !line.includes(domain));
        content.push(`${ipAddress} ${domain}`);
        fs.writeFileSync(hostspath, content.join('\n'));
        console.log(`Successfully mapped ${domain} to ${ipAddress} in ${hostspath}`);
        
        content = fs.readFileSync(hostspath, 'utf8').split('\n');
        content = content.filter(line => !line.includes(domain2));
        content.push(`${ipAddress} ${domain2}`);
        fs.writeFileSync(hostspath, content.join('\n'));
        console.log(`Successfully mapped ${domain2} to ${ipAddress} in ${hostspath}`);
        
    } catch (error) {
        console.error(`Error updating hosts file: ${error.message}`);
    }
}

// Run tasks
updateHosts();
