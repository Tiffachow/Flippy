database:
        @mysql -u $DB_USERNAME -p
        @CREATE DATABASE $DB_NAME; USE $DB_NAME; CREATE TABLE scores (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, alias VARCHAR(30) NOT NULL, score INT NOT NULL);

run:
        @source setup.env
        @node leaderboard/server.js