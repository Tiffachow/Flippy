// Server-side script


var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    multer = require('multer');

// http://stackoverflow.com/questions/14087924/cannot-enqueue-handshake-after-invoking-quitu
function initializeConnection(config) {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error(error.stack);
                    console.log("Lost connection. Reconnecting...");

                    initializeConnection(connection.config);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(config);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}

var connection = initializeConnection({ // to connect to database
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
    var alias = req.body.alias,
        score = req.body.score;
    if (isAlphaNum(alias) && isInt(score)) {
        connection.query("INSERT INTO scores (alias, score) VALUES ('"+alias+"','"+score+"')", function(err, rows, fields) {
            if (err) {
                console.log("Failed to add to database: error:" + err);
                throw err;
            }
        });
    }
});


// Get from database
app.get('/leaderboard', function (req, res) {
    connection.query("SELECT alias, score FROM scores ORDER BY score DESC LIMIT 500", function(err, rows, fields) {
        if (err) throw err;
        res.json({result: rows});
    });
});


var server = app.listen(3000, 'localhost', function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
