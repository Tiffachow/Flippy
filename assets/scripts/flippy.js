var WebFont, beginAudio, loseAudio, audioCtx;
var float = [false, false, false, false, false];
var secret = null;

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
var reachPath = false;
var startTime;
var startPauseTime;
var endPauseTime;
var pauseDuration = 0;
var endTime;
var paused = false;

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
var cloudSize = [];
var sizeRan = [];
var cloudXPathArea,
    cloudYPathArea;
var isReverse = [false, false, false, false];

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


var DEBUG = true;

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
    cloudXPathArea = canvas.width - cloud.width;
    cloudYPathArea = canvas.height - cloud.height;
    cloudPos[0] = [ // Cloud x coords
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random()
    ];
    
    cloudPos[1] = [ // Cloud y coords
        cloudYPathArea * Math.random(),
        cloudYPathArea * Math.random(),
        cloudYPathArea * Math.random(),
        cloudYPathArea * Math.random()
    ];
        
    cloudPos[3] = [
        cloudPos[1][0], 
        cloudPos[1][1], 
        cloudPos[1][2], 
        cloudPos[1][3]
    ];
    
    sizeRan = [
        Math.random() + 0.3,
        Math.random() + 0.3,
        Math.random() + 0.3,
        Math.random() + 0.3
    ];
    
    cloudSize[0] = [ // Cloud width
        cloud.width * sizeRan[0], 
        cloud.width * sizeRan[1], 
        cloud.width * sizeRan[2], 
        cloud.width * sizeRan[3]
    ]; 
    
    cloudSize[1] = [ // Cloud height
        cloud.height * sizeRan[0], 
        cloud.height * sizeRan[1], 
        cloud.height * sizeRan[2], 
        cloud.height * sizeRan[3]
    ]; 

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
                    if (enterKeydown[0]) {
                        text = "AHHH One moment flippy's munching happily on his paw, the next, he's in this strange place???    Help flippy avoid the mystery walls!    ---ENTER to continue.";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                        enterKeydown[0] = false;
                    }
                    if (enterKeydown[1]) {
                        text = "Calibration Time!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                        enterKeydown[1] = false;
                    }
                    if (enterKeydown[2]) {
                        text = "Make a sound at the pitch you would like to be the default.    Not too high or too low!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                        enterKeydown[2] = false;
                    }
                    if (enterKeydown[3]) {
                        calibrate();
                        enterKeydown[3] = false;
                    }
                    if (enterKeydown[4]) {
                        flippyCtx.font = "400 50px Indie Flower";
                        text = "Get Ready...    ENTER to START!";
                        wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
                        enterKeydown[4] = false;
                    }
                    if (enterKeydown[5]) {
                        // start game
                        render();
                        enterKeydown[5] = false;
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
            // Secret
            case 70:
                if (float[0] === false) { 
                    float[0] = true;
                }
                else {
                    float[0] = false;
                }
                break;
            case 76:
                if (float[1] === false) { 
                    float[1] = true;
                }
                else {
                    float[1] = false;
                }
                break;
            case 79:
                if (float[2] === false) { 
                    float[2] = true;
                }
                else {
                    float[2] = false;
                }
                break;
            case 65:
                if (float[3] === false) { 
                    float[3] = true;
                }
                else {
                    float[3] = false;
                }
                break;
            case 84:
                if (float[4] === false) { 
                    float[4] = true;
                }
                else {
                    float[4] = false;
                }
                break;
        }
    });
    

    // Load font
    WebFont.load({
        google: {
            families: ['Indie Flower']
        },
        active: function() {
            flippyCtx.drawImage(background, 0, 0, background.width, background.height); // Draw stationary bg for startup instructions screen
            drawName(); // Draw name of game once for startup instructions screen
            beginAudio.play(); // Play flippy beginning audio clip
            startGame();
        }
    });
}

// Wrap text to get paragraph form
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    flippyCtx.fillStyle = "#00c6ff";
    flippyCtx.clearRect(startX - 10,350,maxWidth + 10,4*lineHeight);
    flippyCtx.fillRect(startX - 10,350,maxWidth + 10,4*lineHeight);
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

// Start the first instructions and set initial properties
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
    text = "CONTROLS: high pitch to flip UP, low pitch to flip DOWN, SPACE to pause.    Alternatives: UP and DOWN keys to flip.    ---ENTER to continue.";
    wrapText(flippyCtx, text, startX, startY, maxWidth, lineHeight);
}

function calibrate() {
    // Browser-compatible getUserMedia forks
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
    
    
    // getUserMedia block - grab audio stream, put it into a MediaStreamAudioSourceNode, connect stream to analyser
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
    
    isGameBegin = false; // Stop enter keydown from triggering instructions

    flippyCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas every render

    //TODO: If view reaches end of our background image, loop bg
    if (position.background < -3000) {
        position.background = 3000;
    }
    
    drawSpace(position.background);
    drawClouds(
        cloudPos[0][0], 
        cloudPos[0][1], 
        cloudPos[0][2], 
        cloudPos[0][3]
    );
    //TODO: drawSun();
    //TODO: drawMoon();
    drawName();
    drawControls();

    // Redraw all the previous lines
    if (positionHistory.length > 0) {
        flippyCtx.beginPath();
        moveLine(positionHistory[0].x, positionHistory[0].y);
        for (var i = 1; i < positionHistory.length; i++) {
            drawLine(positionHistory[i].x, positionHistory[i].y);
        }
        flippyCtx.strokeStyle = "#00c6ff";
        flippyCtx.lineWidth = 5;
        flippyCtx.stroke();
        flippyCtx.closePath();
    }

    $(charImg, charImgR).onload = createChar(); // Create character

    // Move to start, save the position
    flippyCtx.beginPath();
    moveLine(view.right_x, position.y);
    savePosition();

    // Progress all objects consistently and based on how fast game is being rendered
    if (ACCELERATION > 30) {
        view.left_x += 10;
        view.right_x += 10;
        position.cat_x += 10;
        cloudPos[0][0] += 10;
        cloudPos[0][1] += 10;
        cloudPos[0][2] += 10;
        cloudPos[0][3] += 10;
    }
    else {
        view.left_x += 5;
        view.right_x += 5;
        position.cat_x += 5;
        cloudPos[0][0] += 5;
        cloudPos[0][1] += 5;
        cloudPos[0][2] += 5;
        cloudPos[0][3] += 5;
    }

    drawLine(view.right_x, position.y); // Draw the new position of the path
    savePosition(); // Save it

    var randomNum = Math.random(); // Use random number to determine when and where "obstacles" appear

    lastElems = positionHistory.slice(NUM_OF_ELEMS); // Copy the last few positions into a new array lastElems
    
    if (randomNum >= 0 && randomNum < 0.1) { // Randomize when obstacles are created
        if (!lastElems.some(hasDwnObst)) { // Create up obstacle if none of the last 20 positions had a down obstacle
            position.y = UP_OBST_POS;
        }
    }
    else if (randomNum >= 0.9) {
        if (!lastElems.some(hasUpObst)) { // Create down obstacle if none of the last 20 positions had an up obstacle
            position.y = DWN_OBST_POS;
        }
    }

    // Move to new up/down obstacle position (or just to the right / no obstacle), draw it, and save position
    drawLine(view.right_x, position.y);
    savePosition();

    // Move back to baseline position and draw it
    position.y = BASE_POS;
    drawLine(view.right_x, position.y);

    //Exclude out of view positions from being saved
    while (positionHistory[1].x < view.left_x) {
        positionHistory.shift();
    }
    
    // When flippy encounters the beginning of the path, the timer starts and continues
    if (positionHistory[0].x > position.cat_x - 10 && positionHistory[0].x < position.cat_x + 10) {
        startTime = new Date();
        reachPath = true;
    }
    if (reachPath) {
        drawTimer();
    }

    // Set timeout to a gradually increasing frame rate until it hits 20ms
    if (ACCELERATION > 20) {
        ACCELERATION -= 0.01;
    }
    
    // Keep running render every x ms
    renderTimeout = setTimeout(render, ACCELERATION);
    isRunning = true;

    // Secret
    if (float.every(isAllTrue)) {
        promptSecret();
        float = [false, false, false, false, false];
        if (secret == "floppybird") {
            adminOverride();
        }
    }

    // If char hits an obstacle, trigger game over stuff
    if (intersectsChar() === true) {
        // Stop game
        clearTimeout(renderTimeout);
        // Reset to initial conditions of game
        isRunning = false;
        reachPath = false; // timer ends
        // Show game over screen
        loadGameOver();
        // Show retry option
        loadRetry();
    }

}

function isAllTrue(element, index, array) {
  return element === true;
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
function drawClouds(x1, x2, x3, x4) {
    
    // Set shadow of clouds to be black
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 5;
    flippyCtx.shadowBlur = 50;
    flippyCtx.shadowColor = "rgba(0,0,0,0.7)";

    cloudPos[2] = [x1, x2, x3, x4]; // temporary cloud x coords
 
    for (var i = 0; i < 4; i++) {
        // Keep clouds moving horizontally within the view of the game
        cloudPos[2][i] -= view.left_x;
        
        // Record when clouds hit the L/R view borders
        if (cloudPos[0][i] >= (view.right_x - cloudSize[0][i])) {
            isReverse[i] = true;
        }
        else if (cloudPos[0][i] <= view.left_x) {
            isReverse[i] = false;
        }
        
        // Reverse the direction clouds move in when they hit the L/R view borders
        if (isReverse[i]) {
            cloudPos[0][i] -= 2;
        }
        else if (!isReverse[i]) {
            cloudPos[0][i] += 1;
        }
        
        //TODO: bounce clouds up/down
        // if (cloudPos[3][i] < (cloudPos[1][i] + 10)) {
        //     cloudPos[3][i] + 1;
        // }
        // else if (cloudPos[3][i] >= (cloudPos[1][i] + 10)) {
        //     cloudPos[3][i] - 1;
        // }

    }
    
    // Draw clouds
    flippyCtx.drawImage(cloud, cloudPos[2][0], cloudPos[3][0], cloudSize[0][0], cloudSize[1][0]);
    flippyCtx.drawImage(cloud, cloudPos[2][1], cloudPos[3][1], cloudSize[0][1], cloudSize[1][1]);
    flippyCtx.drawImage(cloud, cloudPos[2][2], cloudPos[3][2], cloudSize[0][2], cloudSize[1][2]);
    flippyCtx.drawImage(cloud, cloudPos[2][3], cloudPos[3][3], cloudSize[0][3], cloudSize[1][3]);
    
    // Set shadow properties back to blue
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(0,198,255,0.7)";
}

//TODO: Draw moon in background
function drawMoon(x, y) {
    x -= view.left_x / 4;
    flippyCtx.drawImage(moon, x, 0);
}

//TODO: Draw sun in background
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
    pauseDuration = endPauseTime - startPauseTime; // Keep track of how much time is spent being paused
    endTime = new Date(); // Start keeping track of ms passed
    
    if (paused) {
        startTime.setMilliseconds(startTime.getMilliseconds() + (pauseDuration)); // If paused, add the time passed while paused to the starting time
    }
    
    var msElapsed = endTime - startTime; // The total amount of time passed is the difference between the start and end, accounting for all the paused time
    
    // Logic for calculating how many ms = sec = min
    secElapsed = Math.floor(msElapsed / 1000);
    msCounter = msElapsed % 1000;
    minElapsed = Math.floor(secElapsed / 60);
    secCounter = secElapsed % 60;
    
    // Style the font and draw the min, sec, and ms counter (the sec and ms counters that restart, not the universal ones)
    flippyCtx.font = "400 40px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    flippyCtx.fillText(minElapsed + " m", timerWidth - 100, timerHeight);
    flippyCtx.fillText(secCounter + " s", timerWidth, timerHeight);
    flippyCtx.fillText(msCounter, timerWidth + 90, timerHeight);
    flippyCtx.fillText("ms", timerWidth + 150, timerHeight);
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
            
        RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2;
        RETRY_WIDTH = flippyCtx.measureText("Retry?").width;
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
            
            // Allow player to RETRY by resetting render()'s variables to its initial values and running render
            
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
            cloudPos[0] = [ // Cloud x coords
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random()
            ];
            cloudPos[1] = [ // Cloud y coords
                cloudYPathArea * Math.random(),
                cloudYPathArea * Math.random(),
                cloudYPathArea * Math.random(),
                cloudYPathArea * Math.random()
                ];
                
            isReverse = [false, false, false, false]; // Reset clouds movement directions
            
            // Reset cloud sizes
            sizeRan = [
                Math.random() + 0.3,
                Math.random() + 0.3,
                Math.random() + 0.3,
                Math.random() + 0.3
            ];
            
            cloudSize[0] = [ // Cloud width
                cloud.width * sizeRan[0], 
                cloud.width * sizeRan[1], 
                cloud.width * sizeRan[2], 
                cloud.width * sizeRan[3]
            ]; 
            cloudSize[1] = [ // Cloud height
                cloud.height * sizeRan[0], 
                cloud.height * sizeRan[1], 
                cloud.height * sizeRan[2], 
                cloud.height * sizeRan[3]
            ]; 
            
            // Clear the history arrays
            positionHistory.length = 0;
            lastElems.length = 0;
            
            // Reset the character to default position
            upKeydown = false;
            downKeydown = false;
            lastKeydown = "up";
            
            // Run the game!
            render();
            
            // Cue flippy noise!
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
            startPauseTime = new Date();
            isRunning = false;
        } 
        else { // Otherwise, game is paused, so run it
            endPauseTime = new Date();
            render();
            isRunning = true;
            paused = false;
        }
    }
}

function promptSecret() {
    secret = prompt("Pssst, password please!");
    // if (secret != null) {
    //     float = [false, false, false, false, false];
    // }
}

function adminOverride() {
    alert("YOURE IN");
}

window.onload = function() {
    var load_screen = document.getElementById("load_screen");
	document.body.removeChild(load_screen); // Remove loading screen once everything is loaded
	init();
};


//TODO:
/*
---Write calibrate function
---Add audio capabilities
-x-Add background, 
    ---make background loop or add another bg + other bg objects
---Add sun and moon
-x-Add loading screen
---Add admin override function
-x-Start timer when obstacle course reaches flippy
---Add Fork Me banner
---Add share buttons at retry screen (maybe)
---Make mobile compatible
-x-Clean up commenting and old code
*/
