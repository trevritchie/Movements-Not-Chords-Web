// Define instrument presets
const Instruments = {
    // Nylon guitar sound (similar to original app)
    nylonGuitar: {
        oscillator: {
            type: 'triangle'
        },
        envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.8,
            release: 0.8
        }
    },
    
    // Sawtooth synth (for bass)
    sawtoothBass: {
        oscillator: {
            type: 'sawtooth'
        },
        envelope: {
            attack: 0.05,
            decay: 0.2,
            sustain: 0.8,
            release: 1.5
        }
    }
};

// Export as global if not using modules
window.Instruments = Instruments; 