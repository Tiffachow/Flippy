var flippyCtx;
var canvas;
var ctxEnd;
var ctxBottom;
var acceleration = 50;
var basePos = 400;
var upObstPos = 300;
var downObstPos = 500;
var position = {x: 0, y: 0};
var view = {
  topLeft: {x: 0, y: 0},
  bottomRight: {x: 0, y: 0}
};
var positionHistoryX = [];
var positionHistoryY = [];


function init() {
    // Make the canvas fullscreen
    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    ctxEnd = canvas.width;
    ctxBottom = canvas.height;
    
    // Set the position
    position.x = canvas.width;
    position.y = basePos;
    
    // Set the initial view coordinates
    view.topLeft = {x:0, y:0};
    view.bottomRight = {x:ctxEnd, y:ctxBottom};
    
    // Retrieve the context
    if (canvas.getContext){
        flippyCtx = canvas.getContext("2d");
    }
    
    name();
    renderBaseline();
}

function renderBaseline() {
    flippyCtx.beginPath();
    
    // Move to start, save the position
    flippyCtx.moveTo(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Move to new position and save the position
    position.x += 1;
    flippyCtx.lineTo(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Use random number to determine when and where "obstacles" appear
    var randomNum = Math.floor(Math.random()*1001);
    if (randomNum >= 0 && randomNum < 100) {
        position.y = upObstPos;
    }
    else if (randomNum >= 900) {
        position.y = downObstPos;
    }
    
    // Move to new up/down position (or just to the right) and save position
    flippyCtx.lineTo(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);
    
    // Move back to baseline position and save position
    position.y = basePos;
    flippyCtx.lineTo(position.x, position.y);
    positionHistoryX.push(position.x);
    positionHistoryY.push(position.y);

    //Exclude out of view positions from being saved
    if (positionHistoryX.length > canvas.width) {
        positionHistoryX.shift();
        positionHistoryY.shift();
    }
    
    // Style and draw the line
    flippyCtx.strokeStyle = "#4389A2";
    flippyCtx.lineWidth = 5;
    flippyCtx.stroke();
    flippyCtx.closePath();
    
    // Redraw all the previous lines
    //***DEBUG HERE***
    flippyCtx.beginPath();
    var i = 0;
    for (i=0; i<positionHistoryX.length; i++){
        positionHistoryX[i] -= 1;
        flippyCtx.moveTo(positionHistoryX[0], positionHistoryY[0]);
        flippyCtx.lineTo(positionHistoryX[i], positionHistoryY[i]);
    }
    flippyCtx.strokeStyle = "#4389A2";
    flippyCtx.lineWidth = 5;
    flippyCtx.stroke();
    flippyCtx.closePath();
    
    // Set timeout
    if (acceleration != 10) {
        acceleration -= 0.1;
    }
    setTimeout(renderBaseline, acceleration);
}


function name() {
    flippyCtx.font = "400 150px Indie Flower";
    flippyCtx.fillStyle = "#4389A2";
    var titleWidth = ctxEnd / 4;
    var titleHeight = ctxBottom / 3;
    flippyCtx.fillText("Flippy!",titleWidth,titleHeight);
}

window.onload = init;

/*****



 
 *****/