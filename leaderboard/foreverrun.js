var forever = require('forever-monitor');

var child = new (forever.Monitor)('leaderboard/server.js', { // to run node.js script continuously
    max: 20,
    silent: true,
    args: []
});

child.on('watch:restart', function(info) {
    console.error('Restarting script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});

child.on('exit', function () {
    console.log('server.js has exited after 20 restarts');
});

child.start();