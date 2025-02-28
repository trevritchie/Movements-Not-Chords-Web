// Music theory scales
const Scales = {
    // Scale definitions (pitch classes 0-11)
    // These match the original Python code scales
    MAJOR_SIXTH_DIMINISHED_SCALE: [0, 2, 4, 5, 7, 8, 9, 11],
    MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD: [0, 1, 3, 4, 5, 7, 8, 10],
    MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH: [0, 1, 2, 4, 5, 7, 9, 10],
    MINOR_SEVENTH_DIMINISHED_SCALE: [0, 2, 3, 5, 7, 8, 10, 11], // aka major sixth diminished scale from sixth
    
    MINOR_SIXTH_DIMINISHED_SCALE: [0, 2, 3, 5, 7, 8, 9, 11],
    MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD: [0, 2, 4, 5, 6, 8, 9, 11],
    MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH: [0, 1, 2, 4, 5, 7, 8, 10],
    MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE: [0, 2, 3, 5, 6, 8, 10, 11], // aka minor sixth diminished scale from sixth
    
    DOMINANT_SEVENTH_DIMINISHED_SCALE: [0, 2, 4, 5, 7, 8, 10, 11],
    DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD: [0, 1, 3, 4, 6, 7, 8, 10],
    DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH: [0, 1, 3, 4, 5, 7, 9, 10],
    DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH: [0, 1, 2, 4, 6, 7, 9, 10],
    
    DOMINANT_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE: [0, 2, 4, 5, 6, 8, 10, 11],
    DOMINANT_ROOTS_AND_THEIR_DIMINISHED: [0, 2, 3, 5, 6, 8, 9, 11], // aka whole-half diminished scale
    
    // Traditional scales
    MAJOR_SCALE: [0, 2, 4, 5, 7, 9, 11],
    
    // Map note name to MIDI note number (middle C = 60)
    noteToMidi: function(noteName) {
        return Tonal.Midi.toMidi(noteName);
    },
    
    // Get a scale starting from a root note
    getScale: function(scaleName, rootMidi) {
        const scale = this[scaleName];
        if (!scale) return [];
        
        return scale.map(interval => rootMidi + interval);
    },
};

// Export as global if not using modules
window.Scales = Scales; 