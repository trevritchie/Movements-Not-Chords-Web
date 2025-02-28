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
        // Define button labels/functions
        const buttonConfig = [
            { label: "I", function: "tonic" },
            { label: "ii", function: "supertonic" },
            { label: "iii", function: "mediant" },
            { label: "IV", function: "subdominant" },
            
            { label: "V", function: "dominant" },
            { label: "vi", function: "submediant" },
            { label: "vii°", function: "leading" },
            { label: "I+", function: "tonicOctave" },
            
            { label: "Off", function: "offChord" },
            { label: "Dom", function: "makeDominant" },
            { label: "Alt", function: "alternate" },
            { label: "Fam↑", function: "familyUp" },
            
            { label: "Fam↓", function: "familyDown" },
            { label: "Fam→", function: "familyAcross" },
            { label: "Oct↑", function: "octaveUp" },
            { label: "Oct↓", function: "octaveDown" }
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
            audioEngine = initAudioEngine();
            
            // Play a quick test tone to verify audio works
            const testSynth = new Tone.Synth().toDestination();
            testSynth.triggerAttackRelease("C4", "8n");
            
            // Start listening to device motion
            motionSensor = startAccelerometerListener((data) => {
                // Update UI with motion data
                rollValue.textContent = data.roll.toFixed(1);
                pitchValue.textContent = data.pitch.toFixed(1);
                
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
        
        // For testing, assign chord numerals to buttons 0-7
        if (buttonId >= 0 && buttonId <= 7) {
            // Bottom row buttons are chord numerals
            ChordTheory.chordNumeral = buttonId + 1;
            ChordTheory.offChordLock = false;
        } else if (buttonId === 8) {
            // Toggle off chord
            ChordTheory.offChordLock = !ChordTheory.offChordLock;
        } else if (buttonId === 9) {
            // Toggle dominant
            ChordTheory.dominant = !ChordTheory.dominant;
        }
        
        // Play a test chord
        const testChord = [60, 64, 67, 71]; // Cmaj7
        audioEngine.playChord(testChord);
        
        // Play bass note
        audioEngine.playBassNote(48); // C2
        
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
}); 