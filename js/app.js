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
        console.log('Initializing app...');
        
        // Force start audio context on user gesture
        try {
            console.log('Starting audio context from button click');
            Tone.start();
            // Play a silent sound to ensure audio is initialized
            const silentSynth = new Tone.Synth().toDestination();
            silentSynth.volume.value = -100; // Very quiet
            silentSynth.triggerAttackRelease("C4", 0.1);
        } catch (e) {
            console.error('Failed to start audio context:', e);
        }
        
        // Request motion permission and start the app
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
        console.log('Button pressed:', buttonId);
        
        // Simple direct test - should work regardless of audio engine
        try {
            // Create a new synth each time (not efficient but good for testing)
            const testSynth = new Tone.Synth({
                oscillator: {
                    type: 'triangle'
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5, 
                    release: 0.5
                }
            }).toDestination();
            
            // Play a note based on which button was pressed
            const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
            const note = notes[buttonId % 8];
            
            console.log('Playing direct note:', note);
            testSynth.triggerAttackRelease(note, "4n");
            
            // Also explicitly set volume to make sure it's audible
            testSynth.volume.value = 0; // 0dB = normal volume
            
            return; // Skip the rest of the function for now
        } catch (e) {
            console.error('Direct tone playback failed:', e);
        }
        
        // Rest of the function can be preserved but won't execute due to return
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
        const testSynth = new Tone.Synth().toDestination();
        testSynth.triggerAttackRelease("C4", "8n");
    });
}); 