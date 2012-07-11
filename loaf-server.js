var http = require('http');
var fs = require('fs');
var eyes = require('eyes');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var packages;

parser.on('end', function(result) {
    eyes.inspect(result);
    packages = result;
});

fs.readFile(__dirname + '/config.xml', function(err, data) {
    parser.parseString(data);
});

var port = process.env.PORT || 1337;
http.createServer(function (req, res) {
    // decide action based on url
    var action = decideAction(req.url);

    var response = generateResponse(action);
    
    // respond
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response));
}).listen(port);

function decideAction(url) {
    if (url == '/') {
        return { type: 'list', arguments: '' };
    } else {
        return { type: 'package', arguments: url.substr(1) }
    }
}

function generateResponse(action) {
    var status = 'FAIL';
    var content = 'An unknown error has occurred';

    switch (action.type) {
        case 'list':
            status = 'OK';
            content = packages;
            break;
        case 'package':
            package = action.arguments;
            if (packages[package]) {
                status = 'OK';
                content = packages[package]
            } else {
                content = 'No package named ' + package + ' found';
            }
            break;
    }

    var response = {
        status: status,
        content: content
    };
    
    return response;
}

console.log('Server running at http://127.0.0.1:1337/');
