// Audio Engine using Tone.js
class AudioEngine {
    constructor() {
        this.initialized = false;
        this.synths = [];
        this.currentNotes = [];
        this.bassSynth = null;
        this.bassNote = null;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        // Start audio context
        await Tone.start();
        Tone.Transport.start();
        
        // Create synths for polyphony (4 voices)
        for (let i = 0; i < 4; i++) {
            const synth = new Tone.PolySynth(Tone.Synth).toDestination();
            synth.set({
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0.4,
                    release: 0.5
                }
            });
            this.synths.push(synth);
        }
        
        // Create bass synth
        this.bassSynth = new Tone.Synth({
            oscillator: {
                type: 'sawtooth'
            },
            envelope: {
                attack: 0.05,
                decay: 0.2,
                sustain: 0.8,
                release: 1.5
            }
        }).toDestination();
        
        console.log('Audio engine initialized');
        this.initialized = true;
    }
    
    playChord(notes, duration = '4n') {
        if (!this.initialized) return;
        
        // Stop current notes
        this.stopChord();
        
        // Store the current notes
        this.currentNotes = notes;
        
        // Distribute notes among synths (up to 4 voices)
        const maxVoices = Math.min(notes.length, 4);
        for (let i = 0; i < maxVoices; i++) {
            const note = Tone.Frequency(notes[i], "midi").toNote();
            this.synths[i].triggerAttack(note);
        }
    }
    
    stopChord() {
        if (!this.initialized) return;
        
        // Release all synths
        this.synths.forEach(synth => {
            synth.releaseAll();
        });
        
        this.currentNotes = [];
    }
    
    playBassNote(note, duration = '4n') {
        if (!this.initialized) return;
        
        // Stop current bass note
        this.stopBassNote();
        
        // Store and play the new bass note
        this.bassNote = note;
        const noteFreq = Tone.Frequency(note, "midi").toNote();
        this.bassSynth.triggerAttack(noteFreq);
    }
    
    stopBassNote() {
        if (!this.initialized || !this.bassNote) return;
        
        this.bassSynth.triggerRelease();
        this.bassNote = null;
    }
    
    setDecay(enabled, decayTime = 100) {
        // Implement decay effect similar to the original
        // This will require more sophisticated handling
        console.log('Decay set to:', enabled, decayTime);
    }
}

// Export as global if not using modules
window.AudioEngine = AudioEngine;

// Initialize the audio engine
function initAudioEngine() {
    const audioEngine = new AudioEngine();
    audioEngine.initialize();
    return audioEngine;
}

// Export as global if not using modules
window.initAudioEngine = initAudioEngine; 