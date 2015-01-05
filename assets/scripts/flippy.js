var WebFont, beginAudio, loseAudio, audioCtx;

// Canvas variables
var canvas,
    flippyCtx;

// Web Audio API variables     
var source,
    analyser,
    bufferLength,
    freqDataArray,
    pitchCenter;

// Start Game variables
var isGameBegin;
var enterKeydown = [];
enterKeydown.length = 1;
enterKeydown[0] = false;

// wrapText Variables
var maxWidth;
var lineHeight;
var startX;
var startY;
var text;

// Render function variables
var BASE_POS = 500;
var UP_OBST_POS = 400;
var DWN_OBST_POS = 600;
var NUM_OF_ELEMS = -20;
var ACCELERATION = 60;
var position = {
    y: 0,
    cat_x: 0,
    background: 0,
    cloud: 0
};
var view = {
    left_x: 0,
    right_x: 0
};
var positionHistory = [];
var lastElems = [];
var renderTimeout;

// Timer function variables
var startTime;
var startPauseTime;
var endPauseTime;
var pauseDuration = 0;
var endTime;
var paused = false;
var timerTimeout;

//Background image objects, spritesheet
var background = new Image();
background.src = "/assets/images/flippy/space.jpg";
var sun = new Image();
sun.src = "/assets/images/flippy/sun.png";
var moon = new Image();
moon.src = "/assets/images/flippy/moon.png";
var cloud = new Image();
cloud.src = "/assets/images/flippy/cloud.png";
var cloudPos = [];

// Character object variables
var charImg = new Image();
var charImgR = new Image();
charImg.src = "/assets/images/flippy/char-cat.png";
charImg.width = 35;
charImg.height = 34;
charImgR.src = "/assets/images/flippy/char-cat-r.png";
charImgR.width = 35;
charImgR.height = 34;

// createCharacter function variables
var upKeydown = false;
var downKeydown = false;
var lastKeydown = "up";

// Pause variable
var isRunning;
var isGameOver = null;

// Retry variables
var RETRY_X;
var RETRY_Y = 660;
var RETRY_WIDTH;
var RETRY_HEIGHT = 120;
var x = null,
    y = null;



function init() {
    // Make the canvas fullscreen
    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    // Set size of backgound images
    sun.width = canvas.width * 2.5 / 7;
    sun.height = sun.width * 1680 / 1553;
    moon.width = canvas.width / 3;
    moon.height = moon.width;
    cloud.width = canvas.width / 8;
    cloud.height = cloud.width * 441 / 700;

    // Get the audio clips
    beginAudio = document.getElementsByTagName("audio")[0];
    loseAudio = document.getElementsByTagName("audio")[1];
    
    try { // Set up AudioContext
    // For browser compatibility: safari needs window, webkit/blink needs webkit prefix
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new window.AudioContext();
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

    // Set the position
    view.right_x = canvas.width;
    position = {
        y: BASE_POS,
        cat_x: canvas.width / 2,
        background: 0
    };
    // Set initial random positions of clouds
    cloudPos[2] = {
        a: (canvas.height - cloud.height) * Math.random(),
        b: (canvas.height - cloud.height) * Math.random(),
        c: (canvas.height - cloud.height) * Math.random(),
        d: (canvas.height - cloud.height) * Math.random(),
        e: (canvas.width - cloud.width) * Math.random(),
        f: (canvas.width - cloud.width) * Math.random(),
        g: (canvas.width - cloud.width) * Math.random(),
        h: (canvas.width - cloud.width) * Math.random()
    };

    // Retrieve the context
    if (canvas.getContext) {
        flippyCtx = canvas.getContext("2d");
    }

    // Set variables to listen for enter, up, down and spacebar keydowns
    $(document).keydown(function(event) {
        switch (event.keyCode) {
            // Enter key will enable player to trigger instructions, calibration, and start the game
            case 13:
                enterKeydown.push(true);
                if (isGameBegin) {
                    if (enterKeydown[1]) {
                        text = "AHHH One moment flippy was munching happily on his paw, the next, he was in this crazy world??? Help flippy avoid the mystery walls! ---ENTER to continue.";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                    }
                    if (enterKeydown[2]) {
                        text = "                                                                                     Calibration Time!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                    }
                    if (enterKeydown[3]) {
                        text = "Make a sound at the pitch you would like to be the default. Not too high or too low!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                    }
                    if (enterKeydown[4]) {
                        calibrate();
                    }
                    if (enterKeydown[5]) {
                        flippyCtx.font = "400 50px Indie Flower";
                        text = "      Get Ready...                                 ENTER to START!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                    }
                    if (enterKeydown[6]) {
                        // start game timer
                        startTime = new Date();
                        render();
                        drawTimer();
                        enterKeydown.length = 0;
                    }
                }
                break;
            // UP & DWN keys will trigger character flipping
            case 38:
                upKeydown = true;
                break;
            case 40:
                downKeydown = true;
                break;
            // Set spacebar to pause and resume game
            case 32:
                pauseGame();
                break;
        }
    });
    

    // Load font
    WebFont.load({
        google: {
            families: ['Indie Flower']
        },
        active: function() {
            flippyCtx.drawImage(background, 0, 0, background.width, background.height);
            drawName();
            // Play flippy beginning audio clip
            beginAudio.play();
            startGame();
        }
    });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    flippyCtx.fillStyle = "#00c6ff";
    flippyCtx.clearRect(startX-10,350,maxWidth,3*lineHeight);
    flippyCtx.fillRect(startX-10,350,maxWidth,3*lineHeight);
    var words = text.split(' ');
    var line = '';
    
    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      flippyCtx.fillStyle = "#fff";
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    }

function startGame() {
    isGameBegin = true;
    flippyCtx.font = "100 20px Indie Flower";
    flippyCtx.fillStyle = "#000";
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(0,198,255,0.7)";
    maxWidth = canvas.width / 3;
    lineHeight = 65;
    startX = canvas.width / 2 - canvas.width / 6 + 15;
    startY = 400;
    text = "CONTROLS: high pitch to flip UP, low pitch to flip DOWN, SPACE to pause. Alternatives: UP and DOWN keys to flip. ---ENTER to continue.";
    wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
}

function calibrate() {
    // Browser-compatible getUserMedia forks
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
    
    
    // getUserMedia block - grab audio stream
    // put it into a MediaStreamAudioSourceNode
    // connect stream to analysern
    if (navigator.getUserMedia) {
        navigator.getUserMedia (
            
            // Only audio needed
            {
                audio: "true",
            },
            
            // Success --> Callback
            function(stream) {
                // Create source node, analyser node and connect them together to the AudioContext's destination node
                source = audioCtx.createMediaStreamSource(stream);
                analyser = audioCtx.createAnalyser();
                source.connect(analyser);
                
                analyser.maxDecibels = -50;
                analyser.minDecibels = -150;
                bufferLength = analyser.frequencyBinCount;
                freqDataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(freqDataArray);
                
                pitchCenter = freqDataArray[0];
                flipCharWithStream();
                
            },
            
            // Fail - Error
            function(err) {
                console.log("Error: " + err);
            }
        );
    }
    else {
        alert("getUserMedia not supported in your browser. Please switch to another browser or play with up/down keys.");
    }
}

function flipCharWithStream() {
    for (var i=0; i<bufferLength; i++){
    
    }
}

function render() {
    // Stop enter keydown from triggering instructions
    isGameBegin = false;

    // Clear canvas every render
    flippyCtx.clearRect(0, 0, canvas.width, 320);
    flippyCtx.clearRect(0, 360, canvas.width, canvas.height - 360);

    // If view reaches end of our background image
    if (position.background < -3000) {
        position.background = 3000;
    }
    drawSpace(position.background);
    drawClouds(
        cloudPos[2].e, cloudPos[2].f, cloudPos[2].g, cloudPos[2].h, // Clouds x positions
        cloudPos[2].a, cloudPos[2].b, cloudPos[2].c, cloudPos[2].d, // Clouds y positions
        cloud.width, cloud.height
        );
    // drawSun();
    // drawMoon();
    drawName();
    drawControls();

    // Redraw all the previous lines
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(0,0,0,0.7)";
    if (positionHistory.length > 0) {
        flippyCtx.beginPath();
        moveLine(positionHistory[0].x, positionHistory[0].y);
        for (var i = 1; i < positionHistory.length; i++) {
            drawLine(positionHistory[i].x, positionHistory[i].y);
        }
        /*
        if (positionHistoryY == UP_OBST_POS){
            flippyCtx.strokeStyle = "#b6fbff";
        }
        else if (positionHistoryY == DWN_OBST_POS){
            flippyCtx.strokeStyle = "#0072ff";
        }
        */
        flippyCtx.strokeStyle = "#00c6ff";
        flippyCtx.lineWidth = 5;
        flippyCtx.stroke();
        flippyCtx.closePath();
    }

    // Create character
    $(charImg, charImgR).onload = createChar();

    // Move to start, save the position
    flippyCtx.beginPath();
    moveLine(view.right_x, position.y);
    savePosition();

    // Move to new position and new view and save the position
    if (ACCELERATION > 30) {
        view.left_x += 10;
        view.right_x += 10;
        position.cat_x += 10;
        cloudPos[2].e += 10;
        cloudPos[2].f += 10;
        cloudPos[2].g += 10;
        cloudPos[2].h += 10;
    }
    else {
        view.left_x += 5;
        view.right_x += 5;
        position.cat_x += 5;
        cloudPos[2].e += 5;
        cloudPos[2].f += 5;
        cloudPos[2].g += 5;
        cloudPos[2].h += 5;
    }

    drawLine(view.right_x, position.y);
    savePosition();

    // Use random number to determine when and where "obstacles" appear
    var randomNum = Math.random();

    // Decrease gap between up & down obstacles once frame rate is below 30ms
    /*
    if (ACCELERATION <= 30) {
        NUM_OF_ELEMS = -20;
    }
    */

    // Copy the last few positions into a new array lastElems
    lastElems = positionHistory.slice(NUM_OF_ELEMS);
    if (randomNum >= 0 && randomNum < 0.1) {
        // Create up obstacle if none of the last 20 positions had a down obstacle
        if (!lastElems.some(hasDwnObst)) {
            position.y = UP_OBST_POS;
        }
    }
    else if (randomNum >= 0.9) {
        // Create down obstacle if none of the last 20 positions had an up obstacle
        if (!lastElems.some(hasUpObst)) {
            position.y = DWN_OBST_POS;
        }
    }

    // Move to new up/down obstacle position (or just to the right / no obstacle) and save position
    drawLine(view.right_x, position.y);
    savePosition();

    // Move back to baseline position
    position.y = BASE_POS;
    drawLine(view.right_x, position.y);

    //Exclude out of view positions from being saved
    while (positionHistory[1].x < view.left_x) {
        positionHistory.shift();
    }

    // Set timeout to a gradually increasing frame rate until it hits 20ms
    if (ACCELERATION > 20) {
        ACCELERATION -= 0.01;
    }
    renderTimeout = setTimeout(render, ACCELERATION);
    isRunning = true;


    if (intersectsChar() === true) {
        clearTimeout(renderTimeout);
        isRunning = false;
        loadGameOver();
        loadRetry();
    }

}

// Save all new progressions to a history we can redraw later
function savePosition() {
    positionHistory.push({
        x: view.right_x,
        y: position.y
    });
}

// Set view to follow line's progression
function drawLine(x, y) {
    // view.right_x - view.left_x
    x -= view.left_x;

    // Draw the line
    flippyCtx.lineTo(x, y);
}

// Set view to follow move's progression
function moveLine(x, y) {
    x -= view.left_x;
    flippyCtx.moveTo(x, y);
}

// Set view to follow cat's progression
function drawCat(x, y, z) {
    y -= view.left_x;
    flippyCtx.drawImage(x, y, z, charImg.width, charImg.height);
}

// Test if any of the array's elements (y position) indicate an up obstacle
function hasUpObst(element, index, array) {
    return element.y == UP_OBST_POS;
}

// Test if any of the array's elements (y position) indicate a down obstacle
function hasDwnObst(element, index, array) {
    return element.y == DWN_OBST_POS;
}

// Draw Flippy game title
function drawName() {
    flippyCtx.font = "400 150px Indie Flower";
    flippyCtx.fillStyle = "#00c6ff";
    var titleWidth = canvas.width / 2 - flippyCtx.measureText("Flippy!").width / 2;
    flippyCtx.fillText("Flippy!", titleWidth, 200);
}

// Draw controls reference on side once game has started
function drawControls() {
    flippyCtx.font = "400 20px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    flippyCtx.fillText("SPACE = pause", 25, 40);
}

// Draw space background
function drawSpace(x) {
    x -= view.left_x / 4;
    flippyCtx.drawImage(background, x, 0, background.width, background.height);
}

// Draw clouds in background
function drawClouds(x1, x2, x3, x4, y1, y2, y3, y4, w, h) {
    x1 -= view.left_x;
    x2 -= view.left_x;
    x3 -= view.left_x;
    x4 -= view.left_x;
    cloudPos[0] = {0:x1, 1:x2, 2:x3, 3:x4};
    cloudPos[1] = {0:y1, 1:y2, 2:y3, 3:y4};
    // for (var i = 0; i <= 3; i++) {
    
    //     cloudPos[1].i 
    // }
    //     // If cloud isn't at end of view horizontally, move towards right, otherwise move left
    //     if (cloudPos[0].i < view.right_x) {
    //         if (Math.random() > 0.5) {
    //             cloudPos[0].i += 5;
    //         }
    //         else {
    //             cloudPos[0].i -= 5;
    //         }
    //     }
    //     else {
    //         cloudPos[0].i -= 5;
    //     }
    //     // If cloud isn't at end of view vertically, move down, otherwise move up
    //     if (cloudPos[1].i < canvas.height) {
    //         if (Math.random() > 0.5) {
    //             cloudPos[1].i += 5;
    //         }
    //         else {
    //             cloudPos[1].i -= 5;
    //         }
    //     }
    //     else {
    //         cloudPos[1].i -= 5;
    //     }
    // }
    //var // ran1 = Math.random(),
        // ran2 = Math.random(),
        // ran3 = Math.random(),
        // ran4 = Math.random(),
        // w1 += w * ran1,
        // w2 += w * ran2,
        // w3 += w * ran3,
        // w4 += w * ran4,
        // h1 += h * ran1,
        // h2 += h * ran2,
        // h3 += h * ran3,
        // h4 += h * ran4;
    flippyCtx.drawImage(cloud, cloudPos[0][0], cloudPos[1][0], w, h);
    flippyCtx.drawImage(cloud, cloudPos[0][1], cloudPos[1][1], w, h);
    flippyCtx.drawImage(cloud, cloudPos[0][2], cloudPos[1][2], w, h);
    flippyCtx.drawImage(cloud, cloudPos[0][3], cloudPos[1][3], w, h);
}

// Draw moon in background
function drawMoon(x, y) {
    x -= view.left_x / 4;
    flippyCtx.drawImage(moon, x, 0);
}

//Draw sun in background
function drawSun(x, y) {
    x -= view.left_x / 4;
    flippyCtx.drawImage(sun, x, 0);
}

function drawTimer() {
    var timerWidth = canvas.width / 2 - 50;
    var timerHeight = 350;
    var msCounter = 0;
    var secElapsed = 0;
    var secCounter = 0;
    var minElapsed = 0;
    pauseDuration = endPauseTime - startPauseTime;
    // Start keeping track of ms passed
    endTime = new Date();
    if (paused) {
        startTime.setMilliseconds(startTime.getMilliseconds() + (pauseDuration));
    }
    var msElapsed = endTime - startTime;
    //msElapsed.paused = msElapsed.regular + pauseDuration;
    
    // Logic for calculating how many ms = sec = min
    secElapsed = Math.floor(msElapsed / 1000);
    msCounter = msElapsed % 1000;
    minElapsed = Math.floor(secElapsed / 60);
    secCounter = secElapsed % 60;
    // Style the font and draw the min, sec, and ms counter (the sec and ms counters that restart, not the universal ones)
    flippyCtx.font = "400 40px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(0,198,255,0.7)";
    flippyCtx.fillText(minElapsed + " m", timerWidth - 100, timerHeight);
    flippyCtx.fillText(secCounter + " s", timerWidth, timerHeight);
    flippyCtx.fillText(msCounter, timerWidth + 90, timerHeight);
    flippyCtx.fillText("ms", timerWidth + 150, timerHeight);
    // Run this function every ms
    timerTimeout = setTimeout(drawTimer, 60);

    // If game has ended, stop the timer
    if (intersectsChar() === true) {
        clearTimeout(timerTimeout);
    }

}

function createChar() {
    // If up is pressed, draw rightside up img
    if (upKeydown === true) {
        if (isRunning) {
            drawCat(charImg, position.cat_x, 470);
            // Set last position as up
            lastKeydown = "up";
        }
        // Reset keydown event listener variable
        upKeydown = false;
    }
    // If down is pressed, draw upside down img
    else if (downKeydown === true) {
        if (isRunning) {
            drawCat(charImgR, position.cat_x, 497);
            // Set last position as down
            lastKeydown = "down";
        }
        // Reset keydown event listener variable
        downKeydown = false;
    }

    // If no key was pressed, maintain last position of img
    else {
        // If img was previously in the up position, draw img in up position
        if (lastKeydown == "up") {
            drawCat(charImg, position.cat_x, 470);
        }
        // If img was previously in the down position, draw img in down position
        else if (lastKeydown == "down") {
            drawCat(charImgR, position.cat_x, 497);
        }
    }
}

function intersectsChar() {
    // Return true if: the character is in the up position and there is an up obstacle in the same x position as the character
    if (positionHistory.some(isInMidXUpYPos) && lastKeydown == "up") {
        isGameOver = "yes";
        return true;
    }
    // Return true if: the character is in the down position and there is a down obstacle in the same x position as the character
    else if (positionHistory.some(isInMidXDwnYPos) && lastKeydown == "down") {
        isGameOver = "yes";
        return true;
    }
    else {
        isGameOver = "no";
        return false;
    }
}

// Return true if there is an element that is in the same position as the cat character
function isInMidXUpYPos(element, index, array) {
    return element.x < position.cat_x + 10 && element.x > position.cat_x - 10 && element.y == UP_OBST_POS;
}

function isInMidXDwnYPos(element, index, array) {
    return element.x < position.cat_x + 10 && element.x > position.cat_x - 10 && element.y == DWN_OBST_POS;
}

function loadGameOver() {
    // Draw "Game Over" notice
    flippyCtx.font = "400 100px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    flippyCtx.fillText("Game Over", canvas.width / 2 - flippyCtx.measureText("Game Over").width / 2, 450);
    // Draw Retry? notice
    RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2 + 30;
    flippyCtx.font = "400 80px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    flippyCtx.fillText("Retry?", RETRY_X, RETRY_Y);
    // Cue Flippy Lose audio clip
    loseAudio.play();

}

function loadRetry() {
    $(document).mousemove(function(event) {
        // Get the mouse position relative to the canvas element.
            if (event.pageX) {
                x = event.pageX;
                y = event.pageY;
            }
            
        RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2 - 40;
        RETRY_WIDTH = flippyCtx.measureText("Retry?").width * 2;
        RETRY_Y = 660 + 40;    
            
        // If mouse is over retry area and game is over:    
        if (x >= RETRY_X && x <= (RETRY_X + RETRY_WIDTH) && y <= (RETRY_Y) && y >= (RETRY_Y - RETRY_HEIGHT) && isGameOver == "yes") {
            // Change the cursor into a pointer
            document.body.style.cursor = "pointer";
        }
        // If not over the retry area, cursor is normal
        else {
            document.body.style.cursor = "";
        }
    });
    
    $(document).click(function(ev) { // Check if player has clicked

        // Is the mouse over retry area  while game is over (and user has clicked)?
        if (x >= RETRY_X && x <= (RETRY_X + RETRY_WIDTH) && y <= (RETRY_Y) && y >= (RETRY_Y - RETRY_HEIGHT) && isGameOver == "yes") {
            
            // Allow player to RETRY by:
            // Reset render()'s variables to its initial values and run render
            
            clearTimeout(timerTimeout);
            clearTimeout(renderTimeout);
            ACCELERATION = 60;
            
            // Reset the line position and view position
            position = {
                y: BASE_POS,
                cat_x: canvas.width / 2,
                background: 0,
                cloud: canvas.width / 4
            };
            view = {
                left_x: 0,
                right_x: canvas.width
            };
            
            // Reset the clouds positions
            cloudPos[2] = {
                a: (canvas.height - cloud.height) * Math.random(),
                b: (canvas.height - cloud.height) * Math.random(),
                c: (canvas.height - cloud.height) * Math.random(),
                d: (canvas.height - cloud.height) * Math.random(),
                e: (canvas.width - cloud.width) * Math.random(),
                f: (canvas.width - cloud.width) * Math.random(),
                g: (canvas.width - cloud.width) * Math.random(),
                h: (canvas.width - cloud.width) * Math.random()
            };
            
            // Clear the history arrays
            positionHistory.length = 0;
            lastElems.length = 0;
            
            // Reset the character to default position
            upKeydown = false;
            downKeydown = false;
            lastKeydown = "up";
            
            // Run the game!
            render();
            
            // Reset the timer to its initial conditions and run it from the start!
            startTime = new Date();
            drawTimer();
            
            beginAudio.play();
        }
    });
}

function pauseGame() { // Once spacebar is pressed...
    // Check if game is over
    if (intersectsChar() === false) {
        // Check if game is paused
        if (isRunning) { // If game is running, pause it
            pauseDuration = 0;
            paused = true;
            clearTimeout(renderTimeout);
            clearTimeout(timerTimeout);
            startPauseTime = new Date();
            isRunning = false;
        } 
        else { // Otherwise, game is paused, so run it
            render(); 
            endPauseTime = new Date();
            drawTimer();
            isRunning = true;
            paused = false;
        }
    }
}

window.onload = init;


//TODO:
/*
-x-Fix bug: Retry area still clickable after restarting
---Write calibrate function
---Add audio capabilities
-x-Add background, 
    ---make background loop
-x-Add clouds, 
    ---make them move around
---Add sun and moon
---Add loading screen
---Add admin override function
-x-Prettify instructions and game objects
---Fix bug: timer disappears when game is paused
-x-Revise timer to use Date() objects
*/
