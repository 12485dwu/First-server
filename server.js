// Import (load) the built-in 'http' module from Node.js.
// This module allows Node to create an HTTP server.
const http = require('http');

// Import (load) the built-in 'fs' module, short for "file system".
// It allows Node to read files (like your HTML page) from your computer.
const fs = require('fs');

// Create a server using the http module.
// The createServer() function runs every time someone visits your site.
// It receives a "request" (req) and sends a "response" (res).
const server = http.createServer((req, res) => {
  //build
  console.log('Request for:', req.url, 'Method:', req.method);

  //Handle post request
  if (req.method === 'POST' && req.url === '/add-hobby') {
    let body = '';

    // Collect the data as it comes in
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // When all data has been received
    req.on('end', () => {
      // Parse hobby from form data (URL encoded)
      const params = new URLSearchParams(body);
      const hobby = params.get('hobby');

      console.log('New hobby added:', hobby);

      // Optionally save it to a file or database
      fs.appendFile('hobbies.txt', hobby + '\n', err => {
        if (err) console.error('Error saving hobby:', err);
      });

      // Respond to browser
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<h1>Thanks! Hobby "${hobby}" added.</h1><a href="/about">Go back</a>`);
    });
  }

  // Handle get request.
  if (req.method === 'GET') {
    let filePath = '';

    if (req.url === '/' || req.url === '/home') {
      filePath = 'index.html';
    } else if (req.url === '/about') {
      filePath = 'about.html';
    } else if (req.url === '/contact') {
      filePath = 'contact.html';
    } else if (req.url === '/404') {
      filePath = '404.html';
    } else {
      filePath = '404.html';
    }

  // Use fs.readFile() to read the 'index.html' file from the same folder.
  fs.readFile(filePath, (err, data) => {
    
    // If there’s an error (for example, file not found or read error)...
    if (err) {
      // Send a 500 HTTP status code = "Internal Server Error"
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      // Send back an error message as plain text.
      res.end('Error loading page');
    } 
    //inject hobbies on 'about' or index
    if(req.url === '/about' || req.url === '/home' || req.url === '/') {
      fs.readFile('hobbies.txt', 'utf8', (err, hobbiesData) => {
        let hobbiesList = '';
        if (!err && hobbiesData !=='') {
            const hobbies = hobbiesData.split('\n').filter(hobby => hobby.trim() !== '');
            hobbiesList = '<ul>' + hobbies.map(hobby => `<li>${hobby}</li>`).join('') + '</ul>';
        }
        else {
          hobbiesList = '<p>No hobbies added yet.</p>';
        }   

        //Replace placeholder with actual hobbies list
        const updatedData = data.toString().replace('{{hobbies}}', hobbiesList);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(updatedData);
      });
    }
    // If there’s no error, successfully send the HTML file.
    else {
      // Send a 200 HTTP status code = "OK"
      // Tell the browser we’re sending back an HTML document.
      res.writeHead(200, { 'Content-Type': 'text/html' });
      // Send the actual HTML file data to the browser.
      res.end(data);
    }
  });
}});

// Tell the server to start listening for requests on port 3000.
// (You can visit it in your browser at http://localhost:3000)
server.listen(3000, () => {
  // This message shows up in the terminal when your server starts successfully.
  console.log('Server running at http://localhost:3000');
});
