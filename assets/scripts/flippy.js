var onMobile = false;
var WebFont, load_screen, instructions, control_menu, score_form, leaderboard, beginAudio, loseAudio, audioCtx;

// Secret
var floats = [false, false, false, false, false];
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
    pitchCenter,
    doneCalibrating = false,
    currentPitch = null,
    pitchSamples = [],
    countOfNoPitchFound = 0,
    noPitchThreshold = 10,
    countofSamples = 5;

// Start Game variables
var isGameBegin,
    enterKeydown = [],
    usingVoice = false,
    usingKeyboard = false;

// Render function variables
var BASE_POS,
    UP_OBST_POS,
    DWN_OBST_POS;
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
var timer = {};
var secElapsed,
    msElapsed;

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
charImg.src = "/assets/images/flippy/nyan_cat_sprite.png";
charImg.width = 175;
charImg.height = 80;
var crop = {x:0, y:0};

// createCharacter function variables
var upTriggered = false;
var downTriggered = false;
var lastCharDirection = "up";
var tailPosHistory = []; 

// Pause variable
var isRunning;
var isGameOver = null;

// Retry variables
var RETRY_X,
    RETRY_Y,
    RETRY_WIDTH,
    RETRY_HEIGHT;
var mouse_retry_x = null,
    mouse_retry_y = null;
    
// Leaderboard and submit score variables
var SCORE_X,
    SCORE_Y,
    LEADER_X,
    SCORE_HEIGHT,
    SCORE_WIDTH,
    LEADER_WIDTH,
    mouse_score_x = null,
    mouse_score_y = null,
    submitted = false,
    score_string;

var DEBUG = true;

function init() {
    // Make the canvas fullscreen
    canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    BASE_POS = canvas.height/1.6;
    UP_OBST_POS = canvas.height/1.96;
    DWN_OBST_POS = canvas.height/1.3;
    
    // Set size of backgound images
    sun.width = canvas.width * 2.5 / 7;
    sun.height = sun.width * 1680 / 1553;
    moon.width = canvas.width / 3;
    moon.height = moon.width;
    cloud.width = canvas.width / 8;
    cloud.height = cloud.width * 441 / 700;

    // Get the audio clips
    beginAudio = $("audio")[0];
    loseAudio = $("audio")[1];
    
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

    //TODO
    $(function() {
        if (onMobile) {
            $(document).on("tap", function(){
                if (isGameBegin) {
                    startMobileGame();
                }
                else {
                    pauseOnMobile();
                }
            });
            // $(document).on("tap", pauseOnMobile);
        }
    });

    // Set variables to listen for tap, enter, up, down and spacebar keydowns
    $(document).on("keydown", allEventsHandler);

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

function finishCalibration(event) {
    if (event.keyCode == 13 && doneCalibrating) { // If enter is pressed and calibration is done...
        instructions.hide(); // Hide the calibration guiding screen
        $("#instruct-4-voice").hide(); 
        pauseGame(); // Unpause game
        takeSample(); // Restart taking samples to calculate current pitch to play
        $(document).off("keydown", finishCalibration); // Unbind this function on enter key event, so normal enter keydown handlers can resume
    }
}

function allEventsHandler(event) {
        
    switch (event.keyCode) {
        
        case 67: // Press c to toggle controls
            if (usingVoice) { // Since already calibrated, allow toggling to voice or key controls freely
                usingVoice = false;
                usingKeyboard = true;
            }
            else if (usingKeyboard && doneCalibrating) { // If have already calibrated before, allow toggling to voice controls from keys
                usingKeyboard = false;
                usingVoice = true;
            }
            else { // If haven't calibrated before, pause and calibrate before allowing to toggle to voice controls at will
                recalibrate();
            }
            break;
        
        case 82: // Press r to recalibrate
            recalibrate();
            break;
        
        // Enter key will enable player to trigger instructions, calibration, and start the game
        case 13:
            if ((enterKeydown.length < 3) || ((enterKeydown.length >= 3) && doneCalibrating)) { // Ensures that player can't continue screen during calibration until it's finished
                enterKeydown.push(true);
            }
            if (isGameBegin) {
                
                if (enterKeydown[0]) {
                    $("#instruct-1").hide();
                    askControls(); // Prompt player to choose method of controlling game (voice or keyboard)
                    enterKeydown[0] = false;
                }
                
                if (usingKeyboard) { // If player chose to use keyboard to play, trigger the set of instructions for that
                    
                    if (enterKeydown[1]) {
                        $("#instruct-2-key").hide();
                        $("#instruct-5").show(); // Notify player to get ready to play
                        enterKeydown[1] = false;
                    }
                    if (enterKeydown[2]) {
                        $("#instruct-5").hide();
                        instructions.hide(); // Finish and hide instructions
                        render(); // Run the game
                        enterKeydown[2] = false;
                    }
                }
                
                if (usingVoice) { // If player chose to use voice to play, trigger the set of instructions for that
                    
                    if (enterKeydown[1]) {
                        $("#instruct-2-voice").hide();
                        $("#instruct-3-voice").show();
                        enterKeydown[1] = false;
                    }
                    if (enterKeydown[2]) {
                        $("#instruct-3-voice").hide();
                        $("#instruct-4-voice").show(); // Tell player how to calibrate & show their calibration in real-time
                        createStream(); // Create audio stream and start & conclude calibration process
                        enterKeydown[2] = false;
                    }
                    if (enterKeydown[3]) {
                        $("#instruct-4-voice").hide();
                        $("#instruct-5").show(); // Notify player to get ready to play
                        enterKeydown[3] = false;
                    }
                    if (enterKeydown[4]) {
                        // start game
                        $("#instruct-5").hide();
                        instructions.hide(); // Hide instructions
                        render(); // Start game
                        takeSample(); // Start taking samples of player's pitch to create an average they can use to control Flippy
                        enterKeydown[4] = false;
                    }
                }
            }
            break;
        // UP & DWN keys will trigger character flipping if key controls are active
        case 38:
            if (usingKeyboard) {
                upTriggered = true;
            }
            break;
        case 40:
            if (usingKeyboard) {
                downTriggered = true;
            }
            break;
        // Set spacebar to pause and resume game
        case 32:
            pauseGame();
            break;
        // Secret
        case 70:
            if (floats[0] === false) { 
                floats[0] = true;
            }
            else {
                floats[0] = false;
            }
            break;
        case 76:
            if (floats[1] === false) { 
                floats[1] = true;
            }
            else {
                floats[1] = false;
            }
            break;
        case 79:
            if (floats[2] === false) { 
                floats[2] = true;
            }
            else {
                floats[2] = false;
            }
            break;
        case 65:
            if (floats[3] === false) { 
                floats[3] = true;
            }
            else {
                floats[3] = false;
            }
            break;
        case 84:
            if (floats[4] === false) { 
                floats[4] = true;
            }
            else {
                floats[4] = false;
            }
            break;
    }
}

//TODO
function startMobileGame() {
    createStream();
    render();
    $(document).off("tap", startMobileGame);
    isGameBegin = false;
}

function askControls() { // Prompt player to choose controls, then set the preferred method
    $(document).off("keydown", allEventsHandler); // Temporarily unbind regular events handler
    control_menu.show(); // Show menu to choose controls
    $(".voice-option").attr("id", "selected-control"); // By default, voice controls is selected method
    $(document).on("keydown", chooseControlOption); // Bind handler temporarily in this function to up, down & enter keydowns for choosing controls
    
    $(".option").on("click", function(){ // On clicking a control setting option, ...
        $(this).attr("id", "selected-control"); // Set that option to be the method of controls
        $(".option").not(this).removeAttr("id"); // Set the other option to not be the method of controls
        control_menu.hide(); // Hide the menu
        $(document).off("keydown", chooseControlOption).on("keydown", allEventsHandler); // Unbind the event handler for choosing controls and re-bind the regular event handler function
        setControls(); // Set player's selected controls method/option to be the controls of the game
    });
}

function setControls() { // Set player's selected controls method/option to be the controls of the game
    if (!!$(".voice-option").attr('id')) { // If voice controls are selected, enable voice controls, disable keybard controls
        usingVoice = true;
        usingKeyboard = false;
        $("#instruct-2-voice").show(); // Show the next screen of instructions for voice option
    }
    else if (!!$(".keyboard-option").attr('id')) { // If keyboard controls are selected, enable keyboard controls, disable voice controls
        usingKeyboard = true;
        usingVoice = false;
        $("#instruct-2-key").show(); // Show the next screen of instructions for keyboard option
    }
}

function chooseControlOption(event) { // For choosing control options with keyboard instead of mouse/clicking
    switch (event.keyCode) {
        case 38: // Go up to select voice option
            $(".voice-option:not(:has(#selected-control))").attr("id", "selected-control");
            $(".keyboard-option").removeAttr("id");
            break;
        case 40: // Go down to select keyboard option
            $(".keyboard-option:not(:has(#selected-control))").attr("id", "selected-control");
            $(".voice-option").removeAttr("id");
            break;
        case 13:  // On enter, ...
            control_menu.hide(); // Hide menu to indicate player has chosen 
            $(document).off("keydown", chooseControlOption).on("keydown", allEventsHandler); // Unbind handler for choosing controls and re-bind regular handler for events
            setControls(); // Set game to be played with the player's chosen controls method
            break;
    }
}

// Start the first instructions and set initial properties
function startGame() {
    isGameBegin = true;
    
    if(onMobile) {
        //blah todo
    }
    else {
        instructions.show(); // Start first introduction screen
        $(".instruct-screen").hide(); // Hide all instructions screens for later
        $("#instruct-1").show(); // Show the first instruction screen
    }
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
                freqDataArray = new Float32Array(bufferLength);
                
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
        alert("getUserMedia not supported in your browser. Please switch to another browser or play with keyboard controls.");
    }
}

function recalibrate() {
    pauseGame();
    if (pitch.length != 0) { // If recalibrating, reset pitch values and notify player to get ready
        pitch.length = 0;
        pitchCenter = null;
        $("#instruct-4-voice").html("<br><br><br>Ready to REcalibrate! <br> Try to keep your voice at the same pitch. <br> Keep going 'til you reach 100! <br>");
    }
    else { // If calibrating for first time, notify player
        $("#instruct-4-voice").html("<br><br><br>Ready to CALIBRATE! <br> Try to keep your voice at the same pitch. <br> Keep going 'til you reach 100! <br>");
    }
    instructions.show();
    $("#instruct-4-voice").show();
    createStream(); // Start calibration process
    usingKeyboard = false; // Tell game to use voice controls
    usingVoice = true;
    $(document).on("keydown", finishCalibration); // Bind function (to conclude calibration process) to pressing enter key
}

function calibrate() {
    analyser.getFloatTimeDomainData(freqDataArray); // Each time you calibrate, get a new set of FFT data
    var calibrateCount = "<br> Taking Sample # " + (pitch.length + 1) + "<br><br>";
    
    var freq = autoCorrelate(freqDataArray, audioCtx.sampleRate); // Get frequency/pitch from FFT data collected
    if (freq != -1){
        pitch.push(freq); // If no error or not unable to process signal, then save the pitch
    }
    
    var samplePitch = Math.floor(pitch[pitch.length - 1]) + " Hz <br><br>";
    $("#instruct-4-voice").html(calibrateCount + samplePitch); // Show players their sample # and corresponding pitch in real-time to guide them in calibrating
    
    if (pitch.length < 100) {
        setTimeout(calibrate, 20); // Keep taking samples til we have 100
    }
    else {
        pitchCenter = 0;
        
        for (var i = 0; i < pitch.length; i++) { // Once 100 samples are collected, average them to get the center pitch that up/down flipping is compared off of
            pitchCenter += pitch[i];
        }
        
        pitchCenter /= pitch.length;
        
        var doneCalibrateMsg = "Done Calibrating! Your pitch is :  " + Math.floor(pitchCenter) + " Hz."; 
        $("#instruct-4-voice").html(calibrateCount + samplePitch + doneCalibrateMsg); // Let player know his/her calibrated center pitch
        
        doneCalibrating = true;  // So we can determine if player can continue to next screen and also whether to allow for toggling to voice controls from keyboard controls once game has started
    }
}

// From https://github.com/cwilso/PitchDetect/blob/master/js/pitchdetect.js
function autoCorrelate(freqDataArray, sampleRate) { // Using autocorrelation to determine the pitch from FFT data
	var SIZE = freqDataArray.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i = 0; i < SIZE; i++) {
		var val = freqDataArray[i];
		rms += val * val;
	}
	rms = Math.sqrt(rms / SIZE);
	if (rms < 0.01) // not enough signal
		return -1;

	var lastCorrelation = 1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (i = 0; i < MAX_SAMPLES; i++) {
			correlation += Math.abs((freqDataArray[i]) - (freqDataArray[i + offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation > 0.9) && (correlation > lastCorrelation)) {
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

			// we know best_offset >= 1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset = 1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];  
			return sampleRate / (best_offset + (8 * shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate / best_offset;
	}
	return -1;
    //	var best_frequency = sampleRate/best_offset;
}


function flipCharWithStream() {
    // Averaged pitch above calibrated center will set upTriggered to true, effectively flipping FLippy up
    if (currentPitch >= pitchCenter) {
        upTriggered = true;
    }
    // Averaged pitch below calibrated center will set downTriggered to true, effectively flipping FLippy down
    if (currentPitch < pitchCenter) {
        downTriggered = true;
    }
}

function takeSample() { // Take samples
    analyser.getFloatTimeDomainData(freqDataArray); // Get new set of FFT data
    var freq = autoCorrelate(freqDataArray, audioCtx.sampleRate); // Translate this FFT data to pitch values
    if (freq != -1) { 
        if (countOfNoPitchFound >= noPitchThreshold) {
            pitchSamples.length = 0; // If player is silent for a certain amount of time, clear the saved samples so that past pitches aren't influencing Flippy's movement; better response time
        }
        
        pitchSamples.push(freq); // Save samples of pitch if no error in processing or no silence
        
        if (pitchSamples.length > countofSamples) {
            pitchSamples.shift(); // Keep samples count to a constant number (for now, 5) for averaging
        }
        
        countOfNoPitchFound = 0; // Reset silence tracker if player makes a sound and we are able to process it
    }
    else {
        countOfNoPitchFound++; // Keep track of how long player has been silent or the signal was unable to be processed
    }
    setTimeout(takeSample, 20); // Continuously take samples!
}

function render() {
    
    isGameBegin = false; // Stop enter keydown from triggering instructions

    flippyCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas every render
    
    if (usingVoice) { // If playing with voice, ...
        
        if (pitchSamples.length >= countofSamples) {
            currentPitch = 0;
            for (var i = 0; i < pitchSamples.length; i++) { // Calculate average of last (certain amount of) samples of pitch
                currentPitch += pitchSamples[i];
            }
            currentPitch /= pitchSamples.length;
        }
        
        flipCharWithStream(); // Flip flippy according to whether current pitch is above or below the player's calibrated center
    }
    
    // Drawing background, background objects, and options: pause, toggle controls, and recalibrate
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
    drawPause();
    drawToggleControls();
    
    if (usingVoice) {
        drawRecalibrate();
    }

    // Redraw all the previous lines
    if (positionHistory.length > 0) {
        flippyCtx.beginPath();
        moveLine(positionHistory[0].x, positionHistory[0].y);
        for (var i = 1; i < positionHistory.length; i++) {
            drawLine(positionHistory[i].x, positionHistory[i].y);
        }
        flippyCtx.strokeStyle = "#000";
        flippyCtx.lineWidth = 5;
        flippyCtx.stroke();
        flippyCtx.closePath();
    }
    
    // Draw tail from saved history
    if (tailPosHistory.length > 0) {
        for (var i = 1; i < tailPosHistory.length; i++) {
            drawTail(charImg, tailPosHistory[i].x, tailPosHistory[i].y);
        }
    }
    
    $(charImg).onload = createChar(); // Create character

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
    
    // //TODO
    // // Exclude out of view tails from being drawn
    // if (tailPosHistory[Math.floor(canvas.width / 24)].x > canvas.width / 2) { 
    //     tailPosHistory.shift();
    // }
    
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
    if (floats.every(isAllTrue)) {
        promptSecret();
        floats = [false, false, false, false, false];
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

    if (DEBUG) { // to debug 
        if (usingVoice) { // Show pitch center and current pitch of player in real time (actually leaving in for final version now, seems to make gameplay better)
            var fontSize = canvas.width/60;
            var titleFont = "400 " + fontSize + "px " + "Indie Flower";
            flippyCtx.font = titleFont;
            flippyCtx.fillStyle = "#fff";
            flippyCtx.fillText("Pitch center : " + Math.floor(pitchCenter) + "   Current pitch : " + Math.floor(currentPitch), 25, 25);
        }
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
function drawCat(catsprite, x, y) {
    x -= view.left_x;
    if (crop.x < charImg.width*4/5){
        crop.x += charImg.width/5;
    }
    else {
        crop.x = 0;
    }
    flippyCtx.shadowColor = "rgba(255,215,0,0)";
    flippyCtx.drawImage(catsprite, crop.x, crop.y, charImg.width/5, 22, x, y, charImg.width/5, 22);
    flippyCtx.shadowColor = "rgba(255,215,0,0.5)";
}

// Draw rainbow tail sprite
function drawTail(catsprite, x, y) {
    flippyCtx.shadowColor = "rgba(255,215,0,0)";
    x -= view.left_x;
    
    if (crop.y >= 23 && crop.y < 40) { // change tail's colors to make it look like it's moving
        crop.y += 1;
    }
    else {
        crop.y = 23;
    }
    
    if (Math.round(x / 10) % 2 == 0) { // If the x pos of the cat is even, draw tail higher
        y += 2;
    } 
    else { // Otherwise draw tail lower
        y -= 2;
    }
    flippyCtx.drawImage(catsprite, 0, crop.y, 12, 20, x, y, 12, 20);
    flippyCtx.shadowColor = "rgba(255,215,0,0.5)";
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
    var fontSize = canvas.width/10;
    var titleFont = "400 " + fontSize + "px " + "Indie Flower";
    flippyCtx.font = titleFont;
    flippyCtx.fillStyle = "#000";
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = fontSize/7.5;
    flippyCtx.shadowColor = "rgba(0,198,255,0.7)";
    var titleWidth = canvas.width / 2 - flippyCtx.measureText("Flippy!").width / 2;
    flippyCtx.fillText("Flippy!", titleWidth, canvas.height/3.9);
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
    
    // White shadow for moon
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
    
    // Yellow shadow for sun
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
    if(window.innerHeight > window.innerWidth){
        var timerHeight = canvas.height/3;
    }
    else {
        timerHeight = canvas.height/2.2;
    }
    timer.msCounter = 0;
    secElapsed = 0;
    timer.secCounter = 0;
    timer.minElapsed = 0;
    pauseDuration = endPauseTime - startPauseTime; // Keep track of how much time is spent being paused
    endTime = new Date(); // Start keeping track of ms passed
    
    if (paused) {
        startTime.setMilliseconds(startTime.getMilliseconds() + (pauseDuration)); // If paused, add the time passed while paused to the starting time
    }
    
    msElapsed = endTime - startTime; // The total amount of time passed is the difference between the start and end, accounting for all the paused time
    
    calcScore(msElapsed);
    
    // Style the font and draw the min, sec, and ms counter (the sec and ms counters that restart, not the universal ones)
    flippyCtx.fillStyle = "#fff";
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 20;
    flippyCtx.shadowColor = "rgba(255,255,255,0.7)";
    
    if (onMobile) {
        flippyCtx.font = "400 30px Indie Flower";
        timerWidth = canvas.width / 2 - 40;
    }
    else {
        flippyCtx.font = "400 40px Indie Flower";
    }
    
    flippyCtx.fillText(timer.minElapsed + " m", timerWidth - 100, timerHeight);
    flippyCtx.fillText(timer.secCounter + " s", timerWidth, timerHeight);
    flippyCtx.fillText(timer.msCounter, timerWidth + 90, timerHeight);
    flippyCtx.fillText("ms", timerWidth + 150, timerHeight);
}

function calcScore(msElapsed) {
    // Logic for calculating how many ms = sec = min
    secElapsed = Math.floor(msElapsed / 1000);
    timer.msCounter = msElapsed % 1000;
    timer.minElapsed = Math.floor(secElapsed / 60);
    timer.secCounter = secElapsed % 60;
}

function createChar() {
    // If up is pressed, draw rightside up img
    if (upTriggered === true) {
        if (isRunning) {
            drawTail(charImg, position.cat_x, BASE_POS - 22); // Draw cat's tail
            tailPosHistory.push({x:position.cat_x, y:BASE_POS - 22}); // Save tail position
            // Draw rightside up cat above the line
            crop.y = 0;
            drawCat(charImg, position.cat_x, BASE_POS - 22);
            lastCharDirection = "up"; // Set last position as up
        }
        upTriggered = false; // Reset keydown event listener variable
    }
    // If down is pressed, draw upside down img
    else if (downTriggered === true) {
        if (isRunning) {
            drawTail(charImg, position.cat_x, BASE_POS + 4); // Draw tail of cat
            tailPosHistory.push({x:position.cat_x, y:BASE_POS + 4}); // Save tail's position
            // Draw upside down cat below the line
            crop.y = 60;
            drawCat(charImg, position.cat_x, BASE_POS + 4);
            lastCharDirection = "down"; // Set last position as down
        }
        downTriggered = false; // Reset keydown event listener variable
    }

    // If no key was pressed, maintain last position of img
    else {
        // If img was previously in the up position, draw img in up position
        if (lastCharDirection == "up") {
            drawTail(charImg, position.cat_x, BASE_POS - 22); // Draw cat's tail
            tailPosHistory.push({x:position.cat_x, y:BASE_POS - 22}); // Save tail position
            // Draw cat rightside up above the line
            crop.y = 0;
            drawCat(charImg, position.cat_x, BASE_POS - 22);
        }
        // If img was previously in the down position, draw img in down position
        else if (lastCharDirection == "down") {
            drawTail(charImg, position.cat_x, BASE_POS + 4); // Draw cat's tail
            tailPosHistory.push({x:position.cat_x, y:BASE_POS + 4}); // Save tail position
            // Draw upside down cat below the line
            crop.y = 60;
            drawCat(charImg, position.cat_x, BASE_POS + 4);
        }
    }
}

function intersectsChar() {
    // Return true if: the character is in the up position and there is an up obstacle in the same x position as the character
    if (positionHistory.some(isInMidXUpYPos) && lastCharDirection == "up") {
        isGameOver = "yes";
        return true;
    }
    // Return true if: the character is in the down position and there is a down obstacle in the same x position as the character
    else if (positionHistory.some(isInMidXDwnYPos) && lastCharDirection == "down") {
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
    return element.x < position.cat_x + 28 && element.x > position.cat_x - 18 && element.y == UP_OBST_POS;
}

function isInMidXDwnYPos(element, index, array) {
    return element.x < position.cat_x + 28 && element.x > position.cat_x - 18 && element.y == DWN_OBST_POS;
}

function loadGameOver() {
    // Draw "Game Over" notice (for vertical and horizontal orientations)
    if(window.innerHeight > window.innerWidth){
        var fontSize = canvas.width/10;
        var posY = canvas.height/2.2;
    }
    else {
        fontSize = canvas.width/14.36;
        posY = canvas.height/1.73;
    }
    var titleFont = "400 " + fontSize + "px " + "Indie Flower";
    flippyCtx.font = titleFont;
    flippyCtx.fillStyle = "#fff";
    flippyCtx.fillText("Game Over", canvas.width / 2 - flippyCtx.measureText("Game Over").width / 2, posY);
    // Draw Retry? notice
    RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2;
    fontSize = canvas.width/17.95;
    flippyCtx.font = titleFont;
    RETRY_Y = canvas.height/1.12;
    flippyCtx.fillText("Retry?", RETRY_X, RETRY_Y);
    // Draw Submit Score option w/ black shadow
    flippyCtx.shadowOffsetX = 0;
    flippyCtx.shadowOffsetY = 0;
    flippyCtx.shadowBlur = 10;
    flippyCtx.shadowColor = "rgba(0,0,0,0.5)";
    if(window.innerHeight > window.innerWidth){
        fontSize = canvas.width/20;
    }
    else {
        fontSize = canvas.width/24;
    }
    SCORE_Y = canvas.height/1.35;
    SCORE_X = canvas.width / 2 - flippyCtx.measureText("Submit Score").width/2 - canvas.width/11;
    titleFont = "800 " + fontSize + "px " + "Indie Flower";
    flippyCtx.font = titleFont;
    flippyCtx.fillStyle = "#df1e1e";
    flippyCtx.fillText("SUBMIT SCORE", SCORE_X, SCORE_Y);
    // Draw view Leaderboard option w/ black shadow
    var LEADER_X = canvas.width / 2 + 30;
    if(window.innerHeight > window.innerWidth){
        fontSize = canvas.width/20;
    }
    else {
        fontSize = canvas.width/24;
    }
    titleFont = "800 " + fontSize + "px " + "Indie Flower";
    flippyCtx.font = titleFont;
    flippyCtx.fillStyle = "#ffde2b";
    flippyCtx.fillText("LEADERBOARD", LEADER_X, SCORE_Y);
    // Reset shadow
    flippyCtx.shadowColor = "rgba(0,0,0,0)";
    submitScoreviewLeaderboard();
    // Cue Flippy Lose audio clip
    loseAudio.play();

}

function loadRetry() {
    $(document).mousemove(function(event) {
        // Get the mouse position relative to the canvas element.
            if (event.pageX) {
                mouse_retry_x = event.pageX;
                mouse_retry_y = event.pageY;
            }
            
        RETRY_X = canvas.width / 2 - flippyCtx.measureText("Retry?").width / 2 - 40;
        RETRY_HEIGHT = canvas.height/6.52;
        RETRY_WIDTH = flippyCtx.measureText("Retry?").width + 60;  
            
        // If mouse is over retry area and game is over:    
        if (mouse_retry_x >= RETRY_X && mouse_retry_x <= (RETRY_X + RETRY_WIDTH) && mouse_retry_y <= (RETRY_Y) && mouse_retry_y >= (RETRY_Y - RETRY_HEIGHT + 40) && isGameOver == "yes") {
            // Change the cursor into a pointer
            $("body").css("cursor","pointer");
        }
    });
    
    $(document).off("keydown", allEventsHandler);
    
    if (onMobile) {
        $(document).on("tap", retry);
    }
    $(document).on("click", retry);
}

function retry(ev) { // Check if player has clicked

    // Is the mouse over retry area  while game is over (and player has clicked)?
    if (mouse_retry_x >= RETRY_X && mouse_retry_x <= (RETRY_X + RETRY_WIDTH) && mouse_retry_y <= (RETRY_Y) && mouse_retry_y >= (RETRY_Y - RETRY_HEIGHT + 40) && isGameOver == "yes") {
        
        // Allow player to RETRY by resetting render()'s variables to its initial values and running render
        
        isGameOver = false;
        clearTimeout(renderTimeout);
        ACCELERATION = 60;
        score_form.hide();
        leaderboard.hide();
        
        $(document).on("keydown", allEventsHandler);
        
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
        tailPosHistory.length = 0;
        
        // Reset the character to default position
        currentPitch = null;
        upTriggered = false;
        downTriggered = false;
        lastCharDirection = "up";
        crop = {x:0, y:0};
        
        // Run the game!
        render();
        
        // Cue flippy noise!
        beginAudio.play();
    }
}

function submitScoreviewLeaderboard() {
    $(document).mousemove(function(event) {
        // Get the mouse position relative to the canvas element.
            if (event.pageX) {
                mouse_score_x = event.pageX;
                mouse_score_y = event.pageY;
            }
            
        SCORE_X = canvas.width / 2 - flippyCtx.measureText("SUBMIT SCORE").width - 30;
        LEADER_X = canvas.width / 2 + 30;
        SCORE_WIDTH = flippyCtx.measureText("SUBMIT SCORE").width;
        SCORE_HEIGHT = 52;
        LEADER_WIDTH = flippyCtx.measureText("LEADERBOARD").width;
            
        // If mouse is over submit score area or leaderboard area:    
        if ((mouse_score_x >= SCORE_X && mouse_score_x <= (SCORE_X + SCORE_WIDTH) && mouse_score_y <= SCORE_Y && mouse_score_y >= (SCORE_Y - SCORE_HEIGHT) && isGameOver == "yes") || 
            (mouse_score_x >= LEADER_X && mouse_score_x <= (LEADER_X + LEADER_WIDTH) && mouse_score_y <= SCORE_Y && mouse_score_y >= (SCORE_Y - SCORE_HEIGHT) && isGameOver == "yes")) {
            // Change the cursor into a pointer
            $("body").css("cursor","pointer");
        }
        // If not over the clickable areas, cursor is normal
        else {
            $("body").css("cursor","");
        }
    });
    
    // //TODO
    // score_form.not().click(function() {
    //     score_form.hide();  
    // });
    
    if (onMobile) {
        $(document).on("tap", showSubmitScoreOrLeaderboard);
    }
    $(document).on("click", showSubmitScoreOrLeaderboard);
}

function isAlphaNum(a) {
    var reg = /[^A-Za-z0-9 ]/;
    return !reg.test(a);
}

function showSubmitScoreOrLeaderboard(ev) { // Check if player has clicked

    // Is the mouse over submit score link while game is over (and player has clicked)?
    if (mouse_score_x >= SCORE_X && mouse_score_x <= (SCORE_X + SCORE_WIDTH) && mouse_score_y <= SCORE_Y && mouse_score_y >= (SCORE_Y - SCORE_HEIGHT) && isGameOver == "yes") {
        
        // Show form and hide leaderboard
        if (onMobile) {
            score_form.css({
                width: "80%",
                top: "40%",
                left: "calc((20% - 20px)/2)"
            });
        }
        score_form.show();
        leaderboard.hide();
        
        // On form, let players know the score they're submitting
        score_string = "Your score : "+timer.minElapsed.toString()+" m "+timer.secCounter.toString()+" s "+timer.msCounter.toString()+" ms ";
        $("#score-detail").html(score_string);
        
    }
    
    // Check if player submitted form
    $("#submit").on("click", function(event){
        submitted = true;
    });
    
    if (onMobile) {
        $("#submit").on("tap", function(event){
            submitted = true;
        });
    }
    
    // On submitting our form, send player's alias and score to the server
    if (submitted) {
        var alias = $("#alias").val();
        submitted = false;
        
        if (isAlphaNum(alias) && $("#alias").val().length != 0) {
        
            $.ajax({
                url: "/leaderboard",
                type: "POST",
                data: {alias:alias, score:msElapsed}
            }).done(function(success){
                console.log("New score added to database! " + success);
            }).fail(function(a, b, c) {
                console.log("Failed to add new score to database.");
                console.log(a, b, c);
            });
            
            score_form.hide();
        }
        else {
            alert("Letters, numbers, and space only! Alias cannot be blank.");
        }
        
    }
    
    // If leaderboard link is clicked...
    else if (mouse_score_x >= LEADER_X && mouse_score_x <= (LEADER_X + LEADER_WIDTH) && mouse_score_y <= SCORE_Y && mouse_score_y >= (SCORE_Y - SCORE_HEIGHT) && isGameOver == "yes") {
        
        if (onMobile) {
            leaderboard.css({
                width: "80%",
                top: "35%",
                left: "calc((20% - 20px)/2)"
            });
        }
        leaderboard.show();
        score_form.hide();
    
        $.ajax({ // Get data from database                                        
          url: '/leaderboard',
          type: "GET",
        }).done(function(data)
          { // Print past top scores in leaderboard
          
            var entries = data.result;
            var listTopEntries = "";
            var entryposition = 0;
            
            for (var i = 0; i < entries.length; i++) {
                calcScore(entries[i].score);
                entryposition += 1;
                listTopEntries += entryposition + ".  " + entries[i].alias + " ............ " + timer.minElapsed + " m " + timer.secCounter + " s " + timer.msCounter + " ms " + "<br>";
            }
            
            $('#top-entries').html(listTopEntries); // Update Leaderboard!
            
          }).fail(function(a, b, c) { 
              console.log(a, b, c);
          });
        
    }
}

// Draw pause control reference on side once game has started
function drawPause() {
    flippyCtx.font = "400 20px Indie Flower";
    flippyCtx.fillStyle = "#fff";
    if (onMobile) {
        flippyCtx.fillText("pause", 25, 45);
    }
    else {
        flippyCtx.fillText("SPACE = pause", 25, 45);
    }
}

function drawToggleControls() {
    flippyCtx.fillStyle = "#ffde2b";
    if (onMobile) {
        flippyCtx.fillText("toggle controls", 25, 65);
    }
    else {
        flippyCtx.fillText("press C to toggle controls", 25, 65);
    }
}

function drawRecalibrate() {
    flippyCtx.fillStyle = "#00c6ff";
    if (onMobile) {
        flippyCtx.fillText("recalibrate", 25, 85);
    }
    else {
        flippyCtx.fillText("press R to recalibrate", 25, 85);
    }
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

function pauseOnMobile() { //TODO
    var PAUSE_X = 0;
    var PAUSE_Y = 0;
    var pauseWidth = flippyCtx.measureText("pause").width * 2;
    var PAUSE_HEIGHT = 80 * 2;
    
    //  $(document).mousemove(function(event) {
    //     // Get the mouse position relative to the canvas element.
    //         if (event.pageX) {
    //             mouse_score_x = event.pageX;
    //             mouse_score_y = event.pageY;
    //         }
         
    //  });

    // Is the mouse over pause link while game is running (and player has tapped)?
    if (mouse_score_x >= PAUSE_X && mouse_score_x <= (PAUSE_X + pauseWidth) && mouse_score_y <= PAUSE_Y && mouse_score_y >= (PAUSE_Y - PAUSE_HEIGHT)) {
        
        // Pause/unpause the game
        pauseGame();
    }
}

// Once floats keys are triggered, ask player for password
function promptSecret() {
    secret = prompt("Pssst, password please!");
}

window.onload = function() {
    
    // If on mobile device, check that jQuery Mobile has finished loading before running game
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        onMobile = true;
        if (mobileload) {
            transitionLoad(); // Remove loading screen once everything is loaded
            instructions = $(".instructions").hide();
            control_menu = $("#control-menu");
            control_menu.hide();
            score_form = $("#score-form");
            score_form.hide();
            leaderboard = $("#leaderboard");
            leaderboard.hide();
            init();
        }
    }
    else {
        transitionLoad(); // Remove loading screen once everything is loaded
        instructions = $(".instructions").hide();
        control_menu = $(".control-menu");
        control_menu.hide();
        score_form = $("#score-form");
        score_form.hide();
        leaderboard = $("#leaderboard");
        leaderboard.hide();
        init();
    }
};

function transitionLoad() {
    load_screen = $("#load-screen, #load-screen div");
    load_screen.css({
        transition: "height 1s ease-in-out, color 1s ease-in-out",
        height: "0",
        color: "transparent"
    });
    setTimeout(removeLoad, 1000);
}

function removeLoad() {
    load_screen.remove(); // Remove loading screen once everything is loaded and load screen has finished transitioning out
}


//TODO:
/*
---Figure out forever-monitor implementation / why it's not running continuously
---Exclude drawing trails off screen
---BUG: after using voice controls, clickable area for leaderboard and submit score links are smaller
---Optimize for performance; too laggy
---Close form/leaderboard when clicked outside of those elements
---Make mobile compatible
    ---Fix ugly loading screen on mobile
    -x-Change all absolute measurements to relative to screen sizes
    ---Add mobile events
        ---Start game on tap, pause on tap
*/