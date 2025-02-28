// Chord theory implementation
const ChordTheory = {
    // Current state
    currentScale: 'MAJOR_SIXTH_DIMINISHED_SCALE',
    scaleRoot: 60, // Middle C
    pivotPitch: 60 + (12 * 5), // C5
    chordNumeral: 1,
    offChordLock: false,
    alternate: false,
    dominant: false,
    
    // Map chord numerals to their names (for display)
    getNumeralName(chordNumeral) {
        const numeralNames = {
            1: 'I',  // Tonic
            2: 'ii', // Supertonic
            3: 'iii', // Mediant
            4: 'IV',  // Subdominant
            5: 'V',   // Dominant
            6: 'vi',  // Submediant
            7: 'vii°', // Leading tone
            8: 'I'    // Tonic (octave)
        };
        
        return numeralNames[chordNumeral] || chordNumeral.toString();
    },
    
    // Get current chord name for display
    getCurrentChordName() {
        const numeral = this.getNumeralName(this.chordNumeral);
        const rootNote = Tone.Frequency(this.scaleRoot, "midi").toNote().replace(/\d+$/, "");
        
        let modifier = '';
        if (this.offChordLock) modifier = ' (Off)';
        if (this.dominant) modifier = ' Dom7';
        
        return `${rootNote} ${numeral}${modifier}`;
    },
    
    // Basic implementation of contrary motion
    // This will be expanded based on the Python implementation
    contraryMotion(contraryPitch) {
        const chord = [];
        
        // If at pivot point, just return single note
        if (contraryPitch >= this.pivotPitch) {
            chord.push(this.pivotPitch);
            return chord;
        }
        
        const distanceFromPivot = this.pivotPitch - contraryPitch;
        const voiceCount = Math.min(4, Math.floor(distanceFromPivot / 2) + 1);
        
        // Add bottom note
        chord.push(contraryPitch);
        
        // Add middle voices if needed
        if (voiceCount > 2) {
            for (let i = 1; i < voiceCount - 1; i++) {
                chord.push(contraryPitch + (i * 2));
            }
        }
        
        // Add top voice
        if (voiceCount > 1) {
            chord.push(this.pivotPitch);
        }
        
        return chord;
    },
    
    // Placeholder for oblique motion
    obliqueMotion(obliquePitch) {
        const chord = [];
        
        // Always include the bottom note (held constant)
        const bottomNote = this.pivotPitch - 12; // An octave below pivot
        chord.push(bottomNote);
        
        // Add additional voices based on pitch
        const additionalVoices = Math.min(3, Math.floor(Math.abs(obliquePitch) / 30));
        for (let i = 1; i <= additionalVoices; i++) {
            chord.push(bottomNote + (i * 4)); // Add notes in intervals
        }
        
        return chord;
    },
    
    // Process motion data and return notes to play
    processMotionData(motionData) {
        // Use the roll (gamma) for contrary motion
        const contraryPitch = this.pivotPitch - Math.round(Math.abs(motionData.normalizedRoll) * 12);
        
        // Use the pitch (beta) for oblique motion
        const normalizedPitchValue = Math.abs(motionData.normalizedPitch);
        
        // Choose which motion to use based on which is stronger
        if (Math.abs(motionData.normalizedRoll) > Math.abs(motionData.normalizedPitch)) {
            return this.contraryMotion(contraryPitch);
        } else {
            return this.obliqueMotion(normalizedPitchValue * 100); // Scale for testing
        }
    }
};

// Export as global if not using modules
window.ChordTheory = ChordTheory; 