var WebFont, beginAudio, loseAudio, audioCtx;

// Secret
var float = [false, false, false, false, false];
var secret = null;
var adminOverride = false;

// Canvas variables
var canvas,
    flippyCtx;

// Web Audio API variables     
var source,
    analyser,
    bufferLength,
    freqDataArray,
    MIN_SAMPLES,
    pitch = [],
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
    cloud: 0,
    sun_x: 0,
    sun_y: 0,
    sun_theta: 0,
    moon_x: 0,
    moon_y: 0,
    moon_theta: 0
};
var view = {
    left_x: 0,
    right_x: 0,
    left_x_copy: 0
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
var upDir = true;
var rnd = [];
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


var DEBUG = false;

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
        background: 0,
        sun_x: canvas.width - sun.width / 2,
        sun_y: canvas.height - sun.height / 2,
        sun_theta: 0,
        moon_x: 0 - moon.width / 2,
        moon_y: canvas.height - moon.height / 2,
        moon_theta: 1
    };
    // Set initial random positions of clouds
    cloudXPathArea = canvas.width - cloud.width;
    cloudYPathArea = canvas.height - cloud.height;
    cloudPos.x = [ // Cloud x coords
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random(),
        cloudXPathArea * Math.random()
    ];
    
    rnd = [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random() + 0.3,
        Math.random() + 0.3,
        Math.random() + 0.3,
        Math.random() + 0.3
    ];
    
    cloudPos.init_y = [ // Cloud y-coords
        cloudYPathArea * rnd[0],
        cloudYPathArea * rnd[1],
        cloudYPathArea * rnd[2],
        cloudYPathArea * rnd[3]
    ];
        
    cloudPos.current_y = [ // Copy of initial y-coords
        cloudYPathArea * rnd[0],
        cloudYPathArea * rnd[1],
        cloudYPathArea * rnd[2],
        cloudYPathArea * rnd[3]
    ];
    
    cloudSize[0] = [ // Cloud width
        cloud.width * rnd[4], 
        cloud.width * rnd[5], 
        cloud.width * rnd[6], 
        cloud.width * rnd[7]
    ]; 
    
    cloudSize[1] = [ // Cloud height
        cloud.height * rnd[4], 
        cloud.height * rnd[5], 
        cloud.height * rnd[6], 
        cloud.height * rnd[7]
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
                        createStream();
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

function createStream() {
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
                
                MIN_SAMPLES = 0;
                
                setTimeout(calibrate, 500); // Let analyser populate before asking for values
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

function calibrate() {
    analyser.getByteFrequencyData(freqDataArray);
    pitch.push = autoCorrelate(freqDataArray, audioCtx.sampleRate);
    
    if (pitch.length <= 3) {
        setTimeout(calibrate, 500);
    }

    pitchCenter = (pitch[0] + pitch[1] + pitch[2]) / 3;
}

// From https://github.com/cwilso/PitchDetect/blob/master/js/pitchdetect.js
function autoCorrelate( freqDataArray, sampleRate ) { // Using autocorrelation to determine the pitch from FFT data
	var SIZE = freqDataArray.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = freqDataArray[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((freqDataArray[i])-(freqDataArray[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
    //	var best_frequency = sampleRate/best_offset;
}


function flipCharWithStream() {
    // pitch above calibrated center will set upkeydown to true
    if (pitch[pitch.length - 1] >= pitchCenter) {
        upKeydown = true;
    }
    // pitch below calibrated center will set downkeydown to true
    if (pitch[pitch.length - 1] < pitchCenter) {
        downKeydown = true;
    }
}

function render() {
    
    isGameBegin = false; // Stop enter keydown from triggering instructions

    flippyCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas every render

    analyser.getByteFrequencyData(freqDataArray);
    pitch.push = autoCorrelate(freqDataArray, audioCtx.sampleRate);
    flipCharWithStream();
    
    drawSpace(position.background);
    drawSun(position.sun_x, position.sun_y, position.sun_theta);
    drawMoon(position.moon_x, position.moon_y, position.moon_theta);
    drawClouds(
        cloudPos.x[0], 
        cloudPos.x[1], 
        cloudPos.x[2], 
        cloudPos.x[3]
    );
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
        view.left_x_copy += 10;
        view.right_x += 10;
        position.cat_x += 10;
        cloudPos.x[0] += 10;
        cloudPos.x[1] += 10;
        cloudPos.x[2] += 10;
        cloudPos.x[3] += 10;
    }
    else {
        view.left_x += 5;
        view.left_x_copy += 5;
        view.right_x += 5;
        position.cat_x += 5;
        cloudPos.x[0] += 5;
        cloudPos.x[1] += 5;
        cloudPos.x[2] += 5;
        cloudPos.x[3] += 5;
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
        // Cheat code
        if (secret == "floppybird") {
            adminOverride = true;
        }
        // Return to normal playing mode
        else if (secret == "stop") {
            adminOverride = false;
        }
        // Wrong password
        else {
            alert("Wrong pass!");
        }
    }

    // If char hits an obstacle and player hasn't used cheat code, trigger game over stuff
    if (intersectsChar() === true && !adminOverride) {
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

// Check if every element in array is true
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
    
    x -= view.left_x_copy / 4; // Position space based on view position
    if (x < canvas.width - background.width) { // If reach the end of background image, ...
        x = 0; // Set background position back to beginning of image
        view.left_x_copy = 0; // Set view back to beginning
    }
    flippyCtx.drawImage(background, x, 0, background.width, background.height);
}

// Draw moon in background
function drawMoon(moon_x, moon_y) {
    
    // No shadow for moon
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 0;
    flippyCtx.shadowColor = "rgba(255,255,255)";
    
    var h = canvas.width / 2 - moon.width / 2; // Center of circle, x-coord
    var k = canvas.height - moon.height / 2; // Center of circle, y-coord
    var r = canvas.width / 2; // Radius of circle
    position.moon_theta -= 0.001; // Angle in radians
    moon_x = r*Math.cos(position.moon_theta * Math.PI) + h; // X Position on circle
    moon_y = r*Math.sin(position.moon_theta * Math.PI) + k; // Y Position on circle
    var x = moon_x; // Temp x
    
    flippyCtx.drawImage(moon, x, moon_y, moon.width, moon.height);
}

//Draw sun in background
function drawSun(sun_x, sun_y) {
    
    // No shadow for sun
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(255,215,0,0.5)";
    
    var h = canvas.width / 2 - sun.width / 2; // Center of circle, x-coord
    var k = canvas.height - sun.height / 2; // Center of circle, y-coord
    var r = canvas.width / 2; // Radius of circle
    position.sun_theta -= 0.001; // Angle in radians
    sun_x = r*Math.cos(position.sun_theta * Math.PI) + h; // X Position on circle
    sun_y = r*Math.sin(position.sun_theta * Math.PI) + k; // Y Position on circle
    var x = sun_x; // Temp x
    
    flippyCtx.drawImage(sun, x, sun_y, sun.width, sun.height);
}

// Draw clouds in background
function drawClouds(x1, x2, x3, x4) {
    
    // Set shadow properties back to blue
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(0,198,255,0.7)";

    cloudPos.x_temp = [x1, x2, x3, x4]; // temporary cloud x coords
 
    for (var i = 0; i < 4; i++) {
        // X POSITIONS ===================================================
        // Keep clouds moving horizontally within the view of the game
        cloudPos.x_temp[i] -= view.left_x;
        
        // Record when clouds hit the L/R view borders
        if (cloudPos.x[i] >= (view.right_x - cloudSize[0][i])) {
            isReverse[i] = true;
        }
        else if (cloudPos.x[i] <= view.left_x) {
            isReverse[i] = false;
        }
        
        // Reverse the direction clouds move in when they hit the L/R view borders
        if (isReverse[i]) {
            cloudPos.x[i] -= 2;
        }
        else if (!isReverse[i]) {
            cloudPos.x[i] += 1;
        }

        // Y POSITIONS =====================================================
        // Bounce clouds up/down

        // If cloud y pos is above init pos - 10, change direction to downwards
        if (cloudPos.current_y[i] <= cloudPos.init_y[i] - 10) {
            upDir = false;
        }
        // If cloud y pos is below init pos + 10, change direction to upwards
        else if (cloudPos.current_y[i] >= cloudPos.init_y[i] + 10) {
            upDir = true;
        }
        
        if (upDir) { // Clouds move up
            cloudPos.current_y[i] -= 1;
        }
        else { // Clouds move down
            cloudPos.current_y[i] += 1;
        }
        
    }
    
    // Draw clouds
    flippyCtx.drawImage(cloud, cloudPos.x_temp[0], cloudPos.current_y[0], cloudSize[0][0], cloudSize[1][0]);
    flippyCtx.drawImage(cloud, cloudPos.x_temp[1], cloudPos.current_y[1], cloudSize[0][1], cloudSize[1][1]);
    flippyCtx.drawImage(cloud, cloudPos.x_temp[2], cloudPos.current_y[2], cloudSize[0][2], cloudSize[1][2]);
    flippyCtx.drawImage(cloud, cloudPos.x_temp[3], cloudPos.current_y[3], cloudSize[0][3], cloudSize[1][3]);
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
                sun_x: canvas.width - sun.width / 2,
                sun_y: canvas.height - sun.height / 2,
                sun_theta: 0,
                moon_x: 0 - moon.width / 2,
                moon_y: canvas.height - moon.height / 2,
                moon_theta: 1
            };
            view = {
                left_x: 0,
                left_x_copy: 0,
                right_x: canvas.width
            };
            
            // Reset the clouds positions
            cloudPos.x = [ // Cloud x coords
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random(),
                cloudXPathArea * Math.random()
            ];
            
            cloudPos.init_y = [ // Cloud y-coords
                cloudYPathArea * rnd[0],
                cloudYPathArea * rnd[1],
                cloudYPathArea * rnd[2],
                cloudYPathArea * rnd[3]
            ];
                
            cloudPos.current_y = [ // Copy of initial y-coords
                cloudYPathArea * rnd[0],
                cloudYPathArea * rnd[1],
                cloudYPathArea * rnd[2],
                cloudYPathArea * rnd[3]
            ];
                
            isReverse = [false, false, false, false]; // Reset clouds x movement directions
            upDir = true; // Reset clouds y movement direction
            
            // Reset cloud sizes
            rnd = [
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random() + 0.3,
                Math.random() + 0.3,
                Math.random() + 0.3,
                Math.random() + 0.3
            ];
            
            cloudSize[0] = [ // Cloud width
                cloud.width * rnd[4],
                cloud.width * rnd[5], 
                cloud.width * rnd[6], 
                cloud.width * rnd[7]
            ]; 
            cloudSize[1] = [ // Cloud height
                cloud.height * rnd[4], 
                cloud.height * rnd[5], 
                cloud.height * rnd[6], 
                cloud.height * rnd[7]
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

// Once float keys are triggered, ask player for password
function promptSecret() {
    secret = prompt("Pssst, password please!");
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
---Add share buttons at retry screen (maybe)
---Make mobile compatible
-x-Bounce clouds
*/
