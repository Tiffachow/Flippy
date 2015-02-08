CREATEDB="CREATE DATABASE $(DB_NAME); USE $(DB_NAME); CREATE TABLE scores (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, alias VARCHAR(30) NOT NULL, score INT NOT NULL);"

database:
        @echo $(CREATEDB) | mysql -u $(DB_USERNAME) -p$(DB_PASSWORD)  

run:
        @node leaderboard/server.js