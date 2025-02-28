// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    console.log('MNC Web initializing...');
    
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
    
    // Add these variables near the top of your DOMContentLoaded function
    let lastMotionProcessTime = 0;
    const MOTION_THROTTLE = 300; // Only process motion every 300ms
    let motionSoundsEnabled = false; // Start with motion sounds disabled
    
    // Add this variable to store the current chord
    let currentCalculatedChord = [];
    
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
                    },
                    stopChord: function() {
                        // Implementation needed
                    },
                    stopBassNote: function() {
                        // Implementation needed
                    }
                };
            }
            
            // Verify audio works immediately
            audioEngine.synths[0].triggerAttackRelease("C4", "8n");
            console.log('Test tone sent after initialization');
            
            // Start listening to device motion
            motionSensor = startAccelerometerListener((data) => {
                // Only show the highlighted values (blue boxes)
                document.getElementById('motion-display').innerHTML = `
                    <div class="motion-value highlight">Roll: ${data.roll.toFixed(1)}°</div>
                    <div class="motion-value highlight">Pitch: ${data.pitch.toFixed(1)}°</div>
                `;
                
                // Show current chord numeral at the top instead of motion values
                document.querySelector('header h1').textContent = 
                    `Current Chord: ${ChordTheory.getCurrentChordName()}`;
                
                // Process motion for sound generation
                processMotionData(data);
                
                // Update the visual indicator
                updateOrientationVisual(data.roll, data.pitch);
                
                // Display the current voicing type at the bottom
                updateVoicingTypeDisplay(data);
            });
            
            // Update the chord name display
            updateChordDisplay();
            
            // Add motion sounds toggle button
            addMotionSoundsButton();
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
        
        // Get the function name from the button
        const button = document.querySelector(`[data-button-id="${buttonId}"]`);
        const functionName = button?.dataset.function;
        
        if (!functionName || functionName === '') {
            console.log('No function assigned to this button');
            return;
        }
        
        // Map the new button IDs to functions based on position
        // Bottom row contains chord numerals 1-4
        if (buttonId >= 12 && buttonId <= 15) {
            // Convert from button ID to chord numeral (15 → 1, 14 → 2, etc.)
            const numeralIndex = 15 - buttonId;
            ChordTheory.chordNumeral = numeralIndex + 1;
            ChordTheory.offChordLock = false;
            
            // Play the chord
            playCurrentChord();
            
            // Update display
            updateChordDisplay();
        } 
        // Third row contains chord numerals 5-8
        else if (buttonId >= 8 && buttonId <= 11) {
            // Convert from button ID to chord numeral (11 → 5, 10 → 6, etc.)
            const numeralIndex = 11 - buttonId + 4;
            ChordTheory.chordNumeral = numeralIndex + 1;
            ChordTheory.offChordLock = false;
            
            // Play the chord
            playCurrentChord();
            
            // Update display
            updateChordDisplay();
        }
        // Special function buttons
        else {
            handleSpecialButtonPress(buttonId, functionName);
        }
    }
    
    function handleButtonReleaseAction(buttonId) {
        console.log('Button released action:', buttonId);
        
        // Release the button sound
        if (window.currentButtonSynth) {
            window.currentButtonSynth.triggerRelease();
        }
    }
    
    function processMotionData(data) {
        // Only process motion at certain intervals to avoid overwhelming the system
        const now = Date.now();
        if (now - lastMotionProcessTime < MOTION_THROTTLE) return;
        lastMotionProcessTime = now;
        
        // Calculate the chord based on current motion - but don't play it
        currentCalculatedChord = ChordTheory.processMotionData(data);
        
        // Optionally update visual representation of the chord
        updateChordVisualizer(currentCalculatedChord);
    }
    
    function updateChordDisplay() {
        chordName.textContent = ChordTheory.getCurrentChordName();
    }
    
    // These functions will be implemented in other modules
    function initAudioEngine() {
        // Placeholder - will be implemented in audio-engine.js
        console.log('Audio engine initialized');
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

    // Add this function
    function toggleMotionSounds() {
        motionSoundsEnabled = !motionSoundsEnabled;
        document.getElementById('motion-sounds-button').textContent = 
            motionSoundsEnabled ? 'Disable Motion Sounds' : 'Enable Motion Sounds';
        
        // If enabling, immediately play based on current position
        if (motionSoundsEnabled && motionSensor) {
            processMotionData(motionSensor.getLatestData());
        } else {
            // If disabling, stop all sounds
            if (audioEngine) {
                audioEngine.stopChord();
                audioEngine.stopBassNote();
            }
        }
    }

    // Add a double-tap handler to the motion display area
    document.getElementById('motion-display').addEventListener('dblclick', toggleMotionSounds);

    function handleButtonRelease(buttonId) {
        console.log('Button released:', buttonId);
        
        // Release the button sound
        if (window.currentButtonSynth) {
            window.currentButtonSynth.triggerRelease();
        }
    }

    // Add this function to your app.js
    function updateOrientationVisual(roll, pitch) {
        const visual = document.getElementById('orientation-visual');
        if (!visual) {
            const container = document.createElement('div');
            container.id = 'orientation-visual';
            container.style.width = '100px';
            container.style.height = '100px';
            container.style.margin = '1rem auto';
            container.style.border = '2px solid white';
            container.style.borderRadius = '50%';
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            
            const indicator = document.createElement('div');
            indicator.id = 'orientation-indicator';
            indicator.style.width = '20px';
            indicator.style.height = '20px';
            indicator.style.backgroundColor = 'white';
            indicator.style.borderRadius = '50%';
            indicator.style.position = 'absolute';
            indicator.style.top = '50%';
            indicator.style.left = '50%';
            indicator.style.transform = 'translate(-50%, -50%)';
            
            container.appendChild(indicator);
            document.getElementById('motion-display').after(container);
        }
        
        // Update the indicator position based on roll and pitch
        const indicator = document.getElementById('orientation-indicator');
        const maxAngle = 45; // Maximum angle to represent
        const centerX = 50;
        const centerY = 50;
        
        // Convert angles to position (constrained to the circle)
        const x = centerX + (roll / maxAngle) * 40;
        const y = centerY + (pitch / maxAngle) * 40;
        
        indicator.style.left = `${x}%`;
        indicator.style.top = `${y}%`;
    }

    // Add this after creating your orientation visual
    function addResetButton() {
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Orientation';
        resetButton.className = 'reset-button';
        resetButton.style.margin = '1rem auto';
        resetButton.style.display = 'block';
        
        resetButton.addEventListener('click', () => {
            // Reset the orientation baseline
            if (motionSensor && typeof motionSensor.resetOrientation === 'function') {
                motionSensor.resetOrientation();
                alert('Orientation reset. Hold your device in the neutral position.');
            }
        });
        
        document.getElementById('orientation-visual').after(resetButton);
    }

    // Call this after creating the orientation visual
    addResetButton();

    // Handle button presses for special functions
    function handleSpecialButtonPress(buttonId, functionName) {
        console.log('Special button pressed:', functionName);
        
        switch (functionName) {
            case 'makeDominant':
                ChordTheory.makeDominant();
                break;
            case 'makeOffChord':
                ChordTheory.offChordLock = true;
                break;
            case 'makeOnChord':
                ChordTheory.offChordLock = false;
                break;
            case 'prettySubstitution':
                ChordTheory.usePrettySubstitution();
                break;
            case 'familyUp':
                ChordTheory.familyUp();
                break;
            case 'familyDown':
                ChordTheory.familyDown();
                break;
            case 'familyAcross':
                ChordTheory.familyAcross();
                break;
            case 'octaveUp':
                ChordTheory.octaveUp();
                break;
            case 'octaveDown':
                ChordTheory.octaveDown();
                break;
        }
        
        // Update the chord display
        updateChordDisplay();
        
        // Play the current chord to hear the change
        playCurrentChord();
    }

    // Function to play the current chord
    function playCurrentChord() {
        if (!audioEngine || !audioEngine.initialized) {
            console.error('Audio engine not ready for playback!');
            return;
        }
        
        // Stop any currently playing sounds
        audioEngine.stopChord();
        audioEngine.stopBassNote();
        
        // If we have a calculated chord, play it
        if (currentCalculatedChord && currentCalculatedChord.length > 0) {
            console.log('Playing chord:', currentCalculatedChord);
            audioEngine.playChord(currentCalculatedChord);
            
            // Also play bass note
            const bassNote = Math.min(...currentCalculatedChord) - 12;
            audioEngine.playBassNote(bassNote);
            
            // Update the chord name display
            updateChordDisplay();
        }
    }

    // In your accelerometer handler or update loop
    function handleMotionUpdate(motionData) {
        // Update UI, etc.
        
        // If audio is playing, update the chord based on current motion
        if (audioEngine && audioEngine.isPlaying()) {
            playCurrentChord();
        }
    }

    // Add a button to the UI to toggle motion sounds
    function addMotionSoundsButton() {
        const button = document.createElement('button');
        button.id = 'motion-sounds-button';
        button.textContent = 'Enable Motion Sounds';
        button.classList.add('control-button');
        button.addEventListener('click', toggleMotionSounds);
        
        // Add to controls section
        const controlsSection = document.querySelector('.controls') || mainInterface;
        controlsSection.appendChild(button);
    }

    // Add this function to determine and display the current voicing type
    function updateVoicingTypeDisplay(data) {
        // Calculate contraryPitch from data (similar to processMotionData)
        const roll = data.normalizedRoll;
        const contraryPitch = ChordTheory.scaleRoot + Math.floor((roll + 1) * 36);
        
        // Determine voicing type based on the distance from pivot
        let voicingType = "Unison";
        
        // Only calculate if roll is significant
        if (Math.abs(roll) > 0.05) {
            const distance = ChordTheory.pivotPitch - contraryPitch;
            
            if (distance <= 0) {
                voicingType = "Unison";
            } else if (distance <= 3) {
                voicingType = "Third";
            } else if (distance <= 5) {
                voicingType = "Triad";
            } else if (distance <= 8) {
                voicingType = "Shell";
            } else if (distance <= 12) {
                voicingType = "Octave";
            } else if (distance <= 18) {
                voicingType = "Drop 2";
            } else if (distance <= 22) {
                voicingType = "Drop 3";
            } else if (distance <= 25) {
                voicingType = "Drop 2&4";
            } else {
                voicingType = "Double Octave";
            }
        }
        
        // Display the voicing type at the bottom
        const voicingDisplay = document.getElementById('voicing-display') || createVoicingDisplay();
        voicingDisplay.textContent = `Voicing: ${voicingType}`;
    }

    // Create the voicing display element
    function createVoicingDisplay() {
        const display = document.createElement('div');
        display.id = 'voicing-display';
        display.style.position = 'fixed';
        display.style.bottom = '20px';
        display.style.left = '0';
        display.style.width = '100%';
        display.style.textAlign = 'center';
        display.style.fontSize = '1.5rem';
        display.style.fontWeight = 'bold';
        display.style.color = 'white';
        display.style.backgroundColor = 'rgba(0,0,0,0.5)';
        display.style.padding = '10px';
        document.body.appendChild(display);
        return display;
    }

    // Add a function to update the chord visualizer
    function updateChordVisualizer(chord) {
        // If we have a chord visualizer element, update it
        const visualizer = document.getElementById('chord-visualizer');
        if (visualizer && chord && chord.length > 0) {
            // Clear existing visualizer
            visualizer.innerHTML = '';
            
            // Create a piano-style visualization
            const maxNote = Math.max(...chord);
            const minNote = Math.min(...chord);
            const range = maxNote - minNote + 24; // Add some padding
            
            // Create the visualization container
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.height = '100px';
            container.style.width = '100%';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            
            // Create a representation for each note
            for (let i = minNote - 12; i <= maxNote + 12; i++) {
                const noteElement = document.createElement('div');
                noteElement.style.width = '10px';
                noteElement.style.marginRight = '2px';
                
                // Highlight notes in the chord
                if (chord.includes(i)) {
                    noteElement.style.height = '80px';
                    noteElement.style.backgroundColor = '#4CAF50';
                } else {
                    noteElement.style.height = '40px';
                    noteElement.style.backgroundColor = '#ccc';
                }
                
                // White keys are wider
                const noteNum = i % 12;
                if ([0, 2, 4, 5, 7, 9, 11].includes(noteNum)) {
                    noteElement.style.width = '14px';
                }
                
                container.appendChild(noteElement);
            }
            
            visualizer.appendChild(container);
        }
    }

    console.log('MNC Web initialized');
}); 