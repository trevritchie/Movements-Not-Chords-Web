// Audio Engine for MNC Web - using Tone.js

// Make sure Tone.js is loaded via CDN or as a dependency

// AudioEngine constructor - follows Python class pattern
function AudioEngine() {
    // Properties matching Python implementation
    this.initialized = false;
    this.synths = [];  // Collection of Tone.js instruments
    this.bassInstrument = null;
    this.useChordLock = true;
    this.useMotion = true;
    this.useSmoothing = true;
    this.transpose = -3;  // TRANSPOSE_KEY_SEMITONES from Python
    this.activeNotes = {};
    this.activeBassNote = null;
    
    // Create a reverb effect matching Python's implementation
    this.reverb = null;
}

// Initialize method - aligns with Python's setup
AudioEngine.prototype.initialize = function() {
    if (this.initialized) return true;
    
    console.log('Initializing audio engine...');
    
    try {
        // Start Tone.js
        Tone.start();
        Tone.Transport.start();
        
        // Create main polyphonic instrument for chords
        this.synths[0] = new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.02,
                decay: 0.2, 
                sustain: 0.8,
                release: 1.0
            },
            oscillator: {
                type: 'triangle'
            }
        }).toDestination();
        
        // Create bass instrument (similar to Python's BASS_INSTRUMENT)
        this.bassInstrument = new Tone.Synth({
            envelope: {
                attack: 0.04,
                decay: 0.2,
                sustain: 0.5,
                release: 1.5
            },
            oscillator: {
                type: 'sawtooth'
            }
        }).toDestination();
        
        // Set volumes (matching Python defaults)
        this.synths[0].volume.value = -12;
        this.bassInstrument.volume.value = -15;
        
        // Create reverb effect (matching Python's DEFAULT_REVERB)
        this.reverb = new Tone.Reverb({
            decay: 1.5,
            wet: 0.3
        }).toDestination();
        
        // Connect instruments to reverb
        this.synths[0].connect(this.reverb);
        
        this.initialized = true;
        console.log('Audio engine initialized successfully');
        
        // Play a brief test sound
        this.synths[0].triggerAttackRelease("C4", "16n");
        
        return true;
    } catch (error) {
        console.error('Failed to initialize audio engine:', error);
        return false;
    }
};

// Play a chord - matches Python's play_chord() function
AudioEngine.prototype.playChord = function(notes, velocity = 0.7) {
    if (!this.initialized || !notes || notes.length === 0) return;
    
    console.log('Playing chord:', notes);
    
    // First stop any currently playing notes
    this.stopChord();
    
    // Apply transpose (matching Python's TRANSPOSE_KEY_SEMITONES adjustment)
    const transposedNotes = notes.map(note => note + this.transpose);
    
    // Play notes
    transposedNotes.forEach(note => {
        const freq = Tone.Frequency(note, "midi");
        this.synths[0].triggerAttack(freq, Tone.now(), velocity);
        
        // Register active note
        this.activeNotes[note] = {
            frequency: freq,
            startTime: Tone.now()
        };
    });
    
    return notes;
};

// Play bass note - matches Python's play_bass() function
AudioEngine.prototype.playBassNote = function(note, velocity = 0.8) {
    if (!this.initialized || note === undefined) return;
    
    console.log('Playing bass note:', note);
    
    // Stop any currently playing bass note
    this.stopBassNote();
    
    // Apply transpose
    const transposedNote = note + this.transpose;
    const freq = Tone.Frequency(transposedNote, "midi");
    
    // Play bass note
    this.bassInstrument.triggerAttack(freq, Tone.now(), velocity);
    
    // Register active bass note
    this.activeBassNote = {
        note: transposedNote,
        frequency: freq,
        startTime: Tone.now()
    };
    
    return note;
};

// Stop chord - matches Python's stop_chord()
AudioEngine.prototype.stopChord = function() {
    if (!this.initialized) return;
    
    // Release all notes in the synth
    this.synths[0].releaseAll();
    
    // Clear active notes registry
    this.activeNotes = {};
};

// Stop bass note - matches Python's stop_bass()
AudioEngine.prototype.stopBassNote = function() {
    if (!this.initialized || !this.activeBassNote) return;
    
    // Release bass note
    this.bassInstrument.triggerRelease();
    
    // Clear active bass note
    this.activeBassNote = null;
};

// Process motion data - matches Python's handle_motion_update() function
AudioEngine.prototype.processMotionData = function(data) {
    if (!this.initialized || !this.useMotion) return null;
    
    // Map accelerometer data to musical parameters
    const motionData = ChordTheory.mapAccelerometerToPitch(
        data.x, data.y, data.z
    );
    
    // Process motion data into chord notes
    const motionResult = ChordTheory.processMotionData({
        normalizedPitch: motionData.pitch,
        normalizedRoll: motionData.roll,
        tilt: motionData.tilt
    });
    
    // If we got back chord notes, play them
    if (motionResult && motionResult.length > 0) {
        // Play the chord
        this.playChord(motionResult);
        
        // Play bass note if needed and available
        if (ChordTheory.bassNote) {
            this.playBassNote(ChordTheory.bassNote);
        }
        
        return motionResult;
    }
    
    return null;
};

// Factory function to create and initialize an audio engine
function initAudioEngine() {
    console.log('Creating new AudioEngine instance');
    const engine = new AudioEngine();
    engine.initialize();
    return engine;
}

// Export as global if not using modules
window.AudioEngine = AudioEngine;
window.initAudioEngine = initAudioEngine; 