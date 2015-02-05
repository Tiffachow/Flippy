// Server-side script


var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    multer = require('multer'); 

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'tiffachow',
    password : 'scoresdatabase',
    database : 'scores'
});

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data


function isAlphaNum(a) {
    var reg = /[^A-Za-z0-9 ]/;
    return !reg.test(a);
}

function isInt(a){
    var reg = /[^0-9]/;
    return !reg.test(a);
}

// Post to database
app.post('/leaderboard/', function (req, res) {
    
    connection.connect();
    
    if (isAlphaNum(req.body.alias) && isInt(req.body.score)) {
        connection.query("INSERT INTO scores (id, alias, score) VALUES ('NULL','[alias]','[score]')");
    }
    
    connection.end();
});


// Get from database
app.get('/leaderboard/', function (req, res) {
    
    connection.connect();
    
    connection.query("SELECT scores FROM scores ORDER BY score DESC LIMIT 500", function(err, rows, fields) {
        if (err) throw err;
        res.json({result: rows});
    });
    
    connection.end();
});


var server = app.listen(3000, 'localhost', function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
