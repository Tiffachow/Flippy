var WebFont, audio, loseAudio;

// Canvas variables
var canvas,
    flippyCtx;

// Render function variables
var BASE_POS = 500;
var UP_OBST_POS = 400;
var DWN_OBST_POS = 600;
var NUM_OF_ELEMS = -20;
var ACCELERATION = 60;
var position = {
    y: 0,
    cat_x: 0
};
var view = {
    left_x: 0,
    right_x: 0
};
var positionHistory = [];
var lastElems = [];
var renderTimeout;

// Timer function variables
var MS_ELAPSED = 0;
var MS_RESET_COUNTER = 0;
var SEC_RESET_COUNTER = 0;
var SEC_ELAPSED = 0;
var SEC_COUNTER = 0;
var MIN_ELAPSED = 0;
var timerTimeout;

// Character object variables
var charImg = new Image();
var charImgR = new Image();
charImg.src = "/assets/images/flippy/char-cat.png";
charImg.width = 20;
charImg.height = 29;
charImgR.src = "/assets/images/flippy/char-cat-r.png";
charImgR.width = 20;
charImgR.height = 29;

// createCharacter function variables
var upKeydown = false;
var downKeydown = false;
var lastKeydown = "up";

// Pause variable
var isRunning;

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

    // Get the audio clips
    audio = document.getElementsByTagName("audio")[0];
    loseAudio = document.getElementsByTagName("audio")[1];

    // Set the position
    view.right_x = canvas.width;
    position.y = BASE_POS;
    position.cat_x = canvas.width / 2;

    // Retrieve the context
    if (canvas.getContext) {
        flippyCtx = canvas.getContext("2d");
    }

    // Set variables to listen for up, down and spacebar keypresses
    $(document).keydown(function(event) {
        switch (event.keyCode) {
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
            drawName();
            render();
            drawTimer();
        }
    });
}

function render() {

    flippyCtx.clearRect(0, 380, canvas.width, canvas.height);

    // Redraw all the previous lines
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
    }
    else {
        view.left_x += 5;
        view.right_x += 5;
        position.cat_x += 5;
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
    // Play flippy beginning audio clip
    audio.play();
}

function drawTimer() {
    var timerWidth = canvas.width / 2 - 50;
    var timerHeight = 350;
    flippyCtx.clearRect(0, 320, canvas.width, 40);
    // Start keeping track of ms passed, add 1 ms progression for each run of drawTimer. This counter won't restart.
    MS_ELAPSED += 1;
    // If 100ms have passed, restart the ms counter that will be displayed
    if (MS_RESET_COUNTER == 100) {
        MS_RESET_COUNTER = 0;
    }
    // The ms counter that restarts every 100ms will also progress 1 ms every run
    MS_RESET_COUNTER += 1;
    // If 6000ms have passed, restart the sec counter that will be displayed
    if (SEC_RESET_COUNTER == 6000) {
        SEC_RESET_COUNTER = 0;
    }
    // The sec counter that restarts every 6000ms will also progress 1ms every run
    SEC_RESET_COUNTER += 1;
    // Logic for calculating how many ms = sec = min
    SEC_ELAPSED = MS_ELAPSED / 100;
    SEC_COUNTER = Math.floor(SEC_RESET_COUNTER / 100);
    MIN_ELAPSED = Math.floor(SEC_ELAPSED / 60);
    // Style the font and draw the min, sec, and ms counter (the sec and ms counters that restart, not the universal ones)
    flippyCtx.font = "400 40px Indie Flower";
    flippyCtx.fillStyle = "#000";
    flippyCtx.fillText(MIN_ELAPSED + " m", timerWidth - 100, timerHeight);
    flippyCtx.fillText(SEC_COUNTER + " s", timerWidth, timerHeight);
    flippyCtx.fillText(MS_RESET_COUNTER, timerWidth + 100, timerHeight);
    flippyCtx.fillText("ms", timerWidth + 150, timerHeight);
    // Run this function every ms
    timerTimeout = setTimeout(drawTimer, 1);

    // If game has ended, stop the timer
    if (intersectsChar() === true) {
        clearTimeout(timerTimeout);
    }

}

function createChar() {
    // If up is pressed, draw rightside up img
    if (upKeydown === true) {
        if (isRunning) {
            drawCat(charImg, position.cat_x, 472);
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
            drawCat(charImg, position.cat_x, 472);
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
        return true;
    }
    // Return true if: the character is in the down position and there is a down obstacle in the same x position as the character
    else if (positionHistory.some(isInMidXDwnYPos) && lastKeydown == "down") {
        return true;
    }
    return false;
}

// Return true if there is an element that is in the same position as the cat character
function isInMidXUpYPos(element, index, array) {
    return element.x < position.cat_x + 5 && element.x > position.cat_x - 5 && element.y == UP_OBST_POS;
}

function isInMidXDwnYPos(element, index, array) {
    return element.x < position.cat_x + 5 && element.x > position.cat_x - 5 && element.y == DWN_OBST_POS;
}

function loadGameOver() {
    // Draw "Game Over" notice
    flippyCtx.font = "400 100px Indie Flower";
    flippyCtx.fillStyle = "#000";
    flippyCtx.fillText("Game Over", canvas.width / 2 - flippyCtx.measureText("Game Over").width / 2, 450);
    // Draw Retry? notice
    RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2 + 30;
    flippyCtx.font = "400 80px Indie Flower";
    flippyCtx.fillStyle = "#000";
    flippyCtx.fillText("Retry?", RETRY_X, RETRY_Y);
    // Cue Flippy Lose audio clip
    loseAudio.play();
    
    if (intersectsChar() === true) {
        $(document).mousemove(function(event) {
            // Get the mouse position relative to the canvas element.
                if (event.pageX) {
                    x = event.pageX;
                    y = event.pageY;
                }
                
            RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2 - 40;
            RETRY_WIDTH = flippyCtx.measureText("Retry?").width * 2;
            RETRY_Y = 660 + 40;    
                
            // If mouse is over retry area:    
            if (x >= RETRY_X && x <= (RETRY_X + RETRY_WIDTH) && y <= (RETRY_Y) && y >= (RETRY_Y - RETRY_HEIGHT)) {
                // Change the cursor into a pointer
                document.body.style.cursor = "pointer";
            }
            // If not over the retry area, cursor is normal
            else {
                document.body.style.cursor = "";
            }
        });
    }

    $(document).click(function(ev) { // Check if player has clicked

        // Is the mouse over retry area (and user has clicked)?
        if (x >= RETRY_X && x <= (RETRY_X + RETRY_WIDTH) && y <= (RETRY_Y) && y >= (RETRY_Y - RETRY_HEIGHT)) {
            
            // Allow player to RETRY by:
            // Reset render()'s variables to its initial values and run render
            
            clearTimeout(timerTimeout);
            clearTimeout(renderTimeout);
            ACCELERATION = 60;
            
            // Reset the line position and view position
            position = {
                y: BASE_POS,
                cat_x: canvas.width / 2
            };
            view = {
                left_x: 0,
                right_x: canvas.width
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
            MS_ELAPSED = 0;
            MS_RESET_COUNTER = 0;
            SEC_ELAPSED = 0;
            SEC_RESET_COUNTER = 0;
            MIN_ELAPSED = 0;
            drawTimer();
            
            audio.play();
        }
    });
}

function pauseGame() { // Once spacebar is pressed...
    // Check if game is over
    if (intersectsChar() === false) {
        // Check if game is paused
        if (isRunning) { // If game is running, pause it
            clearTimeout(renderTimeout);
            clearTimeout(timerTimeout);
            isRunning = false;
        }
        else { // Otherwise, game is paused, so run it
            render(); 
            drawTimer();
            isRunning = true;
        }
    }
}

window.onload = init;


//BUGS TO FIX:
/*
-x-Character moving while paused
---Retry area still clickable after restarting
-x-Timer keeps running if you pause after restarting the second time
-x-Canvas < Window, moves when mouse up or down
-x-Restarting sometimes when hovered over, not clicked
-x-Cursor problems
*/