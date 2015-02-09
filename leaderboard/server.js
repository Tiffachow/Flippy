// Server-side script


var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    multer = require('multer');

var connection = mysql.createConnection({ // to connect to database
    host     : process.env.DB_HOST,
    user     : process.env.DB_USERNAME, // get environment variables
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
});

connection.on('error', function (err) {
    console.log(err);
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
app.post('/leaderboard', function (req, res) {
    
    function handleDisconnect() {
        connection.connect(function(err) {              // The server is either down
            if(err) {                                     // or restarting (takes a while sometimes).
              console.log('Error when connecting to db:', err);
              // delay before attempting to reconnect to avoid a hot loop, and to allow 
              // our node script to process asynchronous requests in the meantime
              setTimeout(handleDisconnect, 2000); 
            }
        });
    }
    handleDisconnect();
    
    if (isAlphaNum(req.body.alias) && isInt(req.body.score)) {
        connection.query("INSERT INTO scores (id, alias, score) VALUES ('NULL','[alias]','[score]')", function(err, rows, fields) {
            if (err) throw err;
            console.log("Failed to add to database: error:" + err);
        });
    }
    
    connection.end();
});


// Get from database
app.get('/leaderboard', function (req, res) {
    
    function handleDisconnect() {
        connection.connect(function(err) {              // The server is either down
            if(err) {                                     // or restarting (takes a while sometimes).
              console.log('error when connecting to db:', err);
              // delay before attempting to reconnect to avoid a hot loop, and to allow 
              // our node script to process asynchronous requests in the meantime
              setTimeout(handleDisconnect, 2000); 
            }
        });
    }
    handleDisconnect();
    
    connection.query("SELECT alias, score FROM scores ORDER BY score DESC LIMIT 500", function(err, rows, fields) {
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
