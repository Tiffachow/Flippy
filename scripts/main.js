var flippyCtx;
var canvas;
var ctxEnd;
var ctxBottom;
var ACCELERATION = 45;
var BASE_POS = 500;
var UP_OBST_POS = 400;
var DWN_OBST_POS = 600;
var position = {x: 0, y: 0};
var view = {
  left_x: 0,
  right_x: 0
};
var positionHistoryX = [];
var positionHistoryY = [];
var lastElems = [];
var NUM_OF_ELEMS = -100;
var MS_ELAPSED = 0;
var MS_RESET_COUNTER = 0;
var SEC_RESET_COUNTER = 0;
var SEC_ELAPSED = 0;
var SEC_COUNTER = 0;
var MIN_ELAPSED = 0;

function init() {
    // Make the canvas fullscreen
    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    ctxEnd = canvas.width;
    ctxBottom = canvas.height;
    
    // Set the position
    position.x = canvas.width;
    position.y = BASE_POS;
    
    // Retrieve the context
    if (canvas.getContext){
        flippyCtx = canvas.getContext("2d");
    }
    
    name();
    renderBaseline();
    timer();
}

function renderBaseline() {

    flippyCtx.clearRect(0,380,canvas.width,canvas.height);
    
    // Redraw all the previous lines
    flippyCtx.beginPath();
    var i = positionHistoryX.length - canvas.width * 3;
    moveLine(positionHistoryX[positionHistoryX.length - canvas.width * 3], positionHistoryY[positionHistoryX.length - canvas.width * 3]);
    for (i= positionHistoryX.length - canvas.width * 3; i < positionHistoryX.length; i++) {
        drawLine(positionHistoryX[i], positionHistoryY[i]);
    }
    if (positionHistoryY == UP_OBST_POS){
        flippyCtx.strokeStyle = "#b6fbff";
    }
    else if (positionHistoryY == DWN_OBST_POS){
        flippyCtx.strokeStyle = "#0072ff";
    }
    else {
        flippyCtx.strokeStyle = "#00c6ff";
    }
    flippyCtx.lineWidth = 5;
    flippyCtx.stroke();
    flippyCtx.closePath();
    
    // Move to start, save the position
    flippyCtx.beginPath();
    moveLine(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Move to new position and save the position
    position.x += 1;
    view.left_x += 1;
    drawLine(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Use random number to determine when and where "obstacles" appear
    var randomNum = Math.random();
    if (ACCELERATION == 25) {
        NUM_OF_ELEMS = -50;
    }
    lastElems = positionHistoryY.slice(NUM_OF_ELEMS);
    if (randomNum >= 0 && randomNum < 0.01) {
        // implement up obstacle if none of the last 20 pixels had a down obstacle
        if (!lastElems.some(hasDwnObst)) {
            position.y = UP_OBST_POS;
        }
    }
    else if (randomNum >= 0.99) {
        // implement down obstacle if none of the last 20 pixels had an up obstacle
        if (!lastElems.some(hasUpObst)) {
            position.y = DWN_OBST_POS;
        }
    }
    
    // Move to new up/down position (or just to the right) and save position
    drawLine(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Move back to baseline position and save position
    position.y = BASE_POS;
    drawLine(position.x, position.y);
    
    //Exclude out of view positions from being saved
    //TODO
    if (positionHistoryX.length > canvas.width * 3) {
        positionHistoryX.shift();
        positionHistoryY.shift();
    }
    
    // Set timeout
    if (ACCELERATION != 5) {
        if (ACCELERATION > 30){
            ACCELERATION -= 0.03;
        }
        ACCELERATION -= 0.01;
    }
    setTimeout(renderBaseline, ACCELERATION);
}

// Set view to follow line's progression
function drawLine(x, y) {
    // position.x - view.left_x
    x -= view.left_x;
   
    // Draw the line
    flippyCtx.lineTo(x, y);
}

// Set view to follow move's progression
function moveLine(x, y) {
    x -= view.left_x;
    flippyCtx.moveTo(x, y);
}

// Test if any of the array's elements (y position) indicate an up obstacle
function hasUpObst(element, index, array){
    return element == UP_OBST_POS;
}

// Test if any of the array's elements (y position) indicate a down obstacle
function hasDwnObst(element, index, array){
    return element == DWN_OBST_POS;
}


function name() {
    flippyCtx.font = "400 150px Indie Flower";
    flippyCtx.fillStyle = "#00c6ff";
    var titleWidth = ctxEnd / 2 - 190;
    var titleHeight = 200;
    flippyCtx.fillText("Flippy!",titleWidth,titleHeight);
}

function timer() {
    var timerWidth = ctxEnd / 2 - 50;
    var timerHeight = 350;
    flippyCtx.clearRect(0,320,ctxEnd,40);
    MS_ELAPSED += 1;
    if (MS_RESET_COUNTER == 100){
        MS_RESET_COUNTER = 0;
    }
    MS_RESET_COUNTER += 1;
    if (SEC_RESET_COUNTER == 6000){
        SEC_RESET_COUNTER = 0;
    }
    SEC_RESET_COUNTER += 1;
    SEC_ELAPSED = MS_ELAPSED / 100;
    SEC_COUNTER = Math.floor(SEC_RESET_COUNTER / 100);
    MIN_ELAPSED = Math.floor(SEC_ELAPSED / 60);
    flippyCtx.font = "400 40px Indie Flower";
    flippyCtx.fillStyle = "#00c6ff";
    if (SEC_ELAPSED >= 60){
        flippyCtx.fillText(MIN_ELAPSED + " m",timerWidth - 100,timerHeight);
        flippyCtx.fillText(SEC_COUNTER + " s",timerWidth,timerHeight);
        flippyCtx.fillText(MS_RESET_COUNTER,timerWidth + 100,timerHeight);
        flippyCtx.fillText("ms",timerWidth + 150,timerHeight); 
    }
    else{
        flippyCtx.fillText(SEC_ELAPSED,timerWidth,timerHeight); 
        flippyCtx.fillText("s",timerWidth + 90,timerHeight); 
    }
    setTimeout(timer, 1);
}

window.onload = init;
