# Flippy

## A simple, responsive/mobile-capable, pitch-controlled web app game!

### Play at: http://flippy.heartso.me

#### Fork me! :)) 

## Tech
####* [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
####* Javascript (and Javascript's [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API))
####* and [jQuery](http://api.jquery.com/) (and [jQueryMobile](http://api.jquerymobile.com/))
####* [AJAX](http://api.jquery.com/category/ajax/)
####* [Node.js](http://nodejs.org/api/)
####* [Foreverjs: Forever-Monitor](https://github.com/foreverjs/forever-monitor)
####* [Express.js](http://expressjs.com/)
####* [MySQL](http://dev.mysql.com/doc/refman/5.7/en/) & [MySQL Driver (NPM)](https://www.npmjs.com/package/mysql)

##INSTALL
```sh
   git clone https://github.com/Tiffachow/Flippy.git
   npm install
   #set up your own environment variables for your mysql database configuration:
   #$DB_HOST: mysql server host, $DB_USERNAME: database username, $DB_PASSWORD: database password, $DB_NAME: database name
   
   #If not running Flippy as a service:
        make db
        make run
   
   #If running on ubuntu and you want to run flippy as a service:
        #edit setup.env to match your mysql configuration
        make db
        cp assets/scripts/flippy /etc/init.d/flippy
        sudo service flippy start
```

## Screenshots:

![Mobile](/assets/images/flippy/screenshots/1.png "On Mobile") ![Loading Screen](/assets/images/flippy/screenshots/2.png "Loading Screen")
![Game Begins](/assets/images/flippy/screenshots/3.png "Game Begins!") ![](/assets/images/flippy/screenshots/4.png)
![](/assets/images/flippy/screenshots/5.png) ![](/assets/images/flippy/screenshots/6.png)
![Game Over](/assets/images/flippy/screenshots/7.png "Game Over :<") ![Submit Score](/assets/images/flippy/screenshots/8_.png "Submit Score Screen")
![Leaderboard](/assets/images/flippy/screenshots/9.png "Leaderboard") ![](/assets/images/flippy/screenshots/10.png)


---
## TODO:

* ---Exclude drawing trails off screen
* ---BUG: submits score twice
* ---Close form/leaderboard when clicked outside of those elements
* ---Make mobile compatible
    * ---Fix ugly loading screen on mobile
    * -x-Change all absolute measurements to relative to screen sizes
    * ---Add mobile events
        * ---Start game on tap, pause on tap
* ---Test database, form and leaderboard functionalities

