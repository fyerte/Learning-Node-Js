/*
 *  Primary file for the API
 *
 * 
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
// The server should respond to all request with a string
const server = http.createServer( function (req, res) {

    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.path;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the Query string as an object
    const query = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    })
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to.If one is not found, use not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            query,
            method,
            headers,
            'payload' : buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode = 200, payload = {}) {
            // Use the status code called back by the handler or default 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default the empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request
            console.log('Request received!', trimmedPath, method, query, headers, buffer);

            // Log the response
            console.log('Response', statusCode, payload);
        });
    });  
    
});

// Start the server, and have it listen on port 300
server.listen(3000, function(){
    console.log("The server is listening on port 3000 now");
});

// Define the handlers
const handlers = {}

// Sample handler
handlers.sample = function (data, callback) {

    // Callback a http status code, and a payload object
    callback(406, {'name' : 'sample handler'});
};

// Not Found handler
handlers.notFound = function( data, callback) {

    callback(404);
};

// Define a request router
let router = {
    'sample' : handlers.sample
}