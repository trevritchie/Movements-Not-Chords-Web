// Add this near the top of your app.js file
(function() {
    // Create on-screen console
    const logDiv = document.createElement('div');
    logDiv.id = 'on-screen-console';
    logDiv.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 30vh;
        overflow-y: auto;
        background: rgba(0,0,0,0.8);
        color: white;
        font-family: monospace;
        padding: 10px;
        font-size: 12px;
        z-index: 10000;
        display: flex;
        flex-direction: column-reverse;
    `;
    document.body.appendChild(logDiv);
    
    // Override console methods
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };
    
    function addLogToScreen(type, args) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-${type}`;
        logEntry.style.color = {
            log: 'white',
            error: '#ff4444',
            warn: '#ffbb33',
            info: '#33b5e5'
        }[type];
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${Array.from(args).join(' ')}`;
        
        logDiv.insertBefore(logEntry, logDiv.firstChild);
        
        // Keep only the last 50 entries
        while (logDiv.children.length > 50) {
            logDiv.removeChild(logDiv.lastChild);
        }
    }
    
    // Override console methods
    console.log = function() {
        originalConsole.log.apply(console, arguments);
        addLogToScreen('log', arguments);
    };
    
    console.error = function() {
        originalConsole.error.apply(console, arguments);
        addLogToScreen('error', arguments);
    };
    
    console.warn = function() {
        originalConsole.warn.apply(console, arguments);
        addLogToScreen('warn', arguments);
    };
    
    console.info = function() {
        originalConsole.info.apply(console, arguments);
        addLogToScreen('info', arguments);
    };
})();

// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // References to DOM elements
    const startButton = document.getElementById('start-button');
    const permissionScreen = document.getElementById('permission-screen');
    const mainInterface = document.getElementById('main-interface');
    const touchGrid = document.getElementById('touch-grid');
    const rollValue = document.getElementById('roll-value');
    const pitchValue = document.getElementById('pitch-value');
    const chordName = document.getElementById('chord-name');
    
    // Global instances of our audio and motion systems
    let audioEngine = null;
    let motionSensor = null;
    
    // Initialize components
    createTouchGrid();
    
    // Event listeners
    startButton.addEventListener('click', initializeApp);
    
    // Create the touch grid UI
    function createTouchGrid() {
        // Define button labels/functions in reverse order (control buttons at top, Roman numerals at bottom)
        const buttonConfig = [
            // Top row - Control buttons (previously bottom)
            { label: "", function: "" },
            { label: "Fam↓", function: "octaveUp" },
            { label: "Fam→", function: "familyAcross" },
            { label: "Fam↑", function: "familyDown" },
            
            // Second row - More control buttons
            { label: "Dom", function: "makeDominant" },
            { label: "Off", function: "makeOffChord" },
            { label: "On", function: "makeOnChord" },
            { label: "Pretty", function: "prettySubstitution" },
            
            // Third row - Upper chord numerals
            { label: "I", function: "tonicOctave" },
            { label: "vii°", function: "leading" },
            { label: "vi", function: "submediant" },
            { label: "V", function: "dominant" },
            
            // Bottom row - Lower chord numerals
            { label: "IV", function: "subdominant" },
            { label: "iii", function: "mediant" },
            { label: "ii", function: "supertonic" },
            { label: "I", function: "tonic" }
        ];
        
        // Create 16 buttons (4x4 grid)
        for (let i = 0; i < 16; i++) {
            const button = document.createElement('div');
            button.className = 'grid-button';
            button.dataset.buttonId = i;
            button.dataset.function = buttonConfig[i].function;
            
            // Add label text
            button.textContent = buttonConfig[i].label;
            
            // Add touch event handlers
            button.addEventListener('touchstart', handleButtonTouch);
            button.addEventListener('touchend', handleButtonRelease);
            
            touchGrid.appendChild(button);
        }
    }
    
    // Initialize the app after permission
    function initializeApp() {
        // Request access to device motion
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+ requires explicit permission
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startApp();
                    } else {
                        alert('Motion sensor access is required for this app to work.');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS or older iOS
            startApp();
        }
    }
    
    // Start the app after permissions
    function startApp() {
        // Hide permission screen, show main interface
        permissionScreen.classList.remove('active');
        mainInterface.classList.add('active');
        
        // Initialize the audio engine with explicit user interaction
        // This is crucial for iOS devices
        Tone.start().then(() => {
            console.log('Audio context started successfully');
            
            // Make sure we're actually getting back a valid audio engine
            audioEngine = initAudioEngine();
            console.log('Audio engine initialized:', audioEngine);
            
            if (!audioEngine || !audioEngine.initialized) {
                console.error('Audio engine initialization failed, creating fallback');
                
                // Create a simple fallback audio function
                audioEngine = {
                    initialized: true,
                    synths: [new Tone.Synth().toDestination()],
                    playChord: function(notes) {
                        console.log('Playing chord with fallback:', notes);
                        if (notes && notes.length > 0) {
                            // Convert MIDI note to frequency
                            const freq = Tone.Frequency(notes[0], "midi").toFrequency();
                            this.synths[0].triggerAttackRelease(freq, "8n");
                        }
                    },
                    playBassNote: function(note) {
                        console.log('Playing bass with fallback:', note);
                        // We already played a note in playChord, so we'll skip this for simplicity
                    }
                };
            }
            
            // Verify audio works immediately
            audioEngine.synths[0].triggerAttackRelease("C4", "8n");
            console.log('Test tone sent after initialization');
            
            // Start listening to device motion
            motionSensor = startAccelerometerListener((data) => {
                // Update UI with motion data
                rollValue.textContent = data.roll.toFixed(1);
                pitchValue.textContent = data.pitch.toFixed(1);
                
                // Add more debug info
                document.getElementById('motion-display').innerHTML = `
                    <div class="motion-value">Roll: <span id="roll-value">${data.roll.toFixed(1)}</span>°</div>
                    <div class="motion-value">Pitch: <span id="pitch-value">${data.pitch.toFixed(1)}</span>°</div>
                    <div class="motion-value">Norm Roll: ${data.normalizedRoll?.toFixed(2) || 'N/A'}</div>
                    <div class="motion-value">Norm Pitch: ${data.normalizedPitch?.toFixed(2) || 'N/A'}</div>
                `;
                
                // Process motion for sound generation
                processMotionData(data);
            });
            
            // Update the chord name display
            updateChordDisplay();
        }).catch(error => {
            console.error('Failed to start audio context:', error);
        });
    }
    
    // Handle button touch events
    function handleButtonTouch(event) {
        event.preventDefault();
        const button = event.currentTarget;
        button.classList.add('active');
        
        const buttonId = parseInt(button.dataset.buttonId);
        handleButtonPress(buttonId);
    }
    
    function handleButtonRelease(event) {
        event.preventDefault();
        const button = event.currentTarget;
        button.classList.remove('active');
        
        const buttonId = parseInt(button.dataset.buttonId);
        handleButtonReleaseAction(buttonId);
    }
    
    function handleButtonPress(buttonId) {
        console.log('Button pressed:', buttonId, 'Function:', document.querySelector(`[data-button-id="${buttonId}"]`)?.dataset.function);
        
        // Map the new button IDs to functions based on position
        // Bottom row contains chord numerals 1-4
        if (buttonId >= 12 && buttonId <= 15) {
            console.log('Pressing bottom row chord numeral button');
            // Convert from button ID to chord numeral (15 → 1, 14 → 2, etc.)
            const numeralIndex = 15 - buttonId;
            ChordTheory.chordNumeral = numeralIndex + 1;
            ChordTheory.offChordLock = false;
        } 
        // Third row contains chord numerals 5-8
        else if (buttonId >= 8 && buttonId <= 11) {
            console.log('Pressing third row chord numeral button');
            // Convert from button ID to chord numeral (11 → 5, 10 → 6, etc.)
            const numeralIndex = 11 - buttonId + 4;
            ChordTheory.chordNumeral = numeralIndex + 1;
            ChordTheory.offChordLock = false;
        }
        // Other functional buttons
        else {
            console.log('Pressing function button');
            // Just log which function button was pressed
            const functionName = document.querySelector(`[data-button-id="${buttonId}"]`)?.dataset.function;
            console.log('Function button pressed:', functionName);
        }
        
        // Check audio engine status
        console.log('Audio engine status:', 
            audioEngine ? 'exists' : 'missing', 
            audioEngine?.initialized ? 'initialized' : 'not initialized');
        
        // Try to play sound directly with Tone.js
        try {
            console.log('Attempting to play direct test tone');
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease("C4", "8n");
            console.log('Direct test tone command sent');
        } catch (e) {
            console.error('Failed to play direct test tone:', e);
        }
        
        // Try to use the audio engine
        try {
            if (audioEngine && audioEngine.initialized) {
                // Play a simple C major chord for testing
                const testChord = [60, 64, 67];  // C major
                
                console.log('Playing test chord via audio engine:', testChord);
                audioEngine.playChord(testChord);
                
                // Play bass note
                audioEngine.playBassNote(48); // C2
            } else {
                console.error('Audio engine not ready for playback!');
            }
        } catch (e) {
            console.error('Error playing through audio engine:', e);
        }
        
        // Update the chord name display
        updateChordDisplay();
    }
    
    function handleButtonReleaseAction(buttonId) {
        console.log('Button released:', buttonId);
        // For now, we'll keep sounds playing when buttons are released
    }
    
    function processMotionData(data) {
        console.log('Motion data:', data);
        // Only process if audio engine is ready
        if (!audioEngine || !audioEngine.initialized) {
            console.log('Audio engine not ready');
            return;
        }
        
        // Get notes based on motion data
        const notes = ChordTheory.processMotionData(data);
        console.log('Notes to play:', notes);
        
        // Play the notes
        if (notes.length > 0) {
            audioEngine.playChord(notes);
            
            // Also play a bass note for foundation
            const bassNote = notes[0] - 24; // Two octaves lower
            audioEngine.playBassNote(bassNote);
        }
    }
    
    function updateChordDisplay() {
        chordName.textContent = ChordTheory.getCurrentChordName();
    }
    
    // These functions will be implemented in other modules
    function initAudioEngine() {
        // Placeholder - will be implemented in audio-engine.js
        console.log('Audio engine initialized');
    }
    
    function startAccelerometerListener(callback) {
        // Placeholder - will be implemented in accelerometer.js
        console.log('Accelerometer listener started');
        
        // Simulate motion data for testing
        setInterval(() => {
            callback({
                roll: Math.random() * 90 - 45,  // -45 to 45
                pitch: Math.random() * 90 - 45  // -45 to 45
            });
        }, 100);
    }
    
    // Required for iOS to allow audio
    document.body.addEventListener('touchstart', function() {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
    }, {once: true});

    // Simple test to verify audio works at all
    document.body.addEventListener('click', function() {
        console.log('Body clicked, trying to play sound');
        
        // Create a completely new synth and audio context each time
        Tone.context.close(); // Close any existing context
        Tone.context = new AudioContext(); // Create fresh context
        
        const newSynth = new Tone.Synth().toDestination();
        newSynth.triggerAttackRelease("C4", "8n");
        
        // Save this synth to a global variable for debugging
        window.debugSynth = newSynth;
        
        // Also show audio context state
        console.log('Audio context state:', Tone.context.state);
    });

    // Add this near the top of your app.js file (after creating a free account)
    // Using a CDN approach for simplicity
    const script = document.createElement('script');
    script.src = 'https://cdn.logrocket.io/LogRocket.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = function() {
        window.LogRocket && window.LogRocket.init('your-app/mnc');
        
        // Add console capture
        LogRocket.getSessionURL(sessionURL => {
            console.log('LogRocket session:', sessionURL);
        });
    };
    document.head.appendChild(script);
}); 