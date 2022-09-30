var express = require('express');

var server = express();

const OPERATORS = {
    "ADD": items => items.reduce((x,y) => y+x),
    "SUB": items => items.reduce((x,y) => x-y),
    "MUL": items => items.reduce((x,y) => y*x),
    "DIV": items => items.reduce((x,y) => x/y),
}

server.use('/api/:ope/:items', (req, res) => {
    res.json({
        result:
        String(
            OPERATORS[String(req.params.ope).toUpperCase()]
                (req.params.items.split(",").map(Number)))
    })
});


server.use('/js', express.static(__dirname + '/js'));
server.use('/css', express.static(__dirname + '/css'));

server.use('/', (req, res) => res.sendFile(__dirname + '/spreadsheet.html'));

server.listen(8080);