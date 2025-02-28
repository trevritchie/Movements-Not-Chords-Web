// Barry Harris Chord Theory Implementation
// Based on the original mnc.py implementation

// Enhanced ChordTheory object
const ChordTheory = {
    // Current state
    currentScale: 'MAJOR_SIXTH_DIMINISHED_SCALE',
    scaleRoot: 60, // Middle C
    pivotPitch: 72, // C4 (matching the Python implementation)
    chordNumeral: 1,
    offChordLock: false,
    alternate: false,
    dominant: false,
    pretty: false,
    familyUp: false,
    familyDown: false,
    familyAcross: false,
    bassNote: 48, // Bass C
    
    // Get the current scale array
    getCurrentScale() {
        return Scales[this.currentScale] || Scales.MAJOR_SIXTH_DIMINISHED_SCALE;
    },
    
    // Get name of current chord
    getCurrentChordName() {
        if (this.offChordLock) {
            return 'Off (No Chord)';
        }
        
        const scaleType = this.currentScale.includes('MINOR') ? 'minor' : 'major';
        const degreeNames = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', 'I'];
        
        let chordName = degreeNames[this.chordNumeral - 1] || 'I';
        
        // Add modifiers
        if (this.dominant) {
            chordName += '7';
        }
        if (this.alternate) {
            chordName += ' alt';
        }
        if (this.pretty) {
            chordName += ' (pretty)';
        }
        
        return `${chordName} ${scaleType}`;
    },
    
    // Implement contrary motion - matching Python implementation exactly
    contraryMotion(contraryPitch) {
        const chord = [];
        const OCTAVE = 12;
        
        // If playing the pivot pitch, play one note
        if (contraryPitch >= this.pivotPitch) {
            chord.push(this.pivotPitch);
            return chord;
        }
        
        // Map pitches to a pitch class (0 to 11),
        // adjusted to make "0" represent the scale root
        const scale = this.getCurrentScale();
        const inputPitchClass = (contraryPitch - this.scaleRoot) % OCTAVE;
        const pivotPitchClass = (this.pivotPitch - this.scaleRoot) % OCTAVE;
        
        // Find scale degrees - directly from Python implementation
        let inputScaleDegree = -1;
        let pivotScaleDegree = -1;
        
        for (let i = 0; i < scale.length; i++) {
            if (scale[i] === inputPitchClass) {
                inputScaleDegree = i;
            }
            if (scale[i] === pivotPitchClass) {
                pivotScaleDegree = i;
            }
        }
        
        // If either pitch is not in scale, return empty chord
        if (inputScaleDegree === -1 || pivotScaleDegree === -1) {
            return [];
        }
        
        const inputOctave = Math.floor(contraryPitch / OCTAVE);
        let currentOctave = inputOctave;
        const octaveSpread = Math.floor(Math.abs(contraryPitch - this.pivotPitch) / OCTAVE);
        let previousPitch = contraryPitch;
        
        // How many notes should be in the chord?
        let chordWidth = 1 + ((pivotScaleDegree - inputScaleDegree) % 8) + (8 * octaveSpread);
        
        // Max chord size is double octave chord so oblique motion works
        chordWidth = Math.min(chordWidth, 9);
        
        // Chord voicings by width
        const octaveChord = 5;
        const drop2 = 6;
        const drop3 = 7;
        const drop2and4 = 8;
        const doubleOctaveChord = 9;
        
        // Fill in the chord list by taking a note, skipping a note, taking a note...
        // until the desired chord width is achieved
        let contrary = 0; // Used for iteration to build the polyphony
        
        for (let note = 1; note <= chordWidth; note++) {
            let currentPitch = scale[(inputScaleDegree + contrary) % 8] + 
                                this.scaleRoot + 
                                (OCTAVE * (currentOctave - 1));
            
            // Keep adding higher notes
            if (currentPitch < previousPitch) {
                currentOctave += 1;
                currentPitch += OCTAVE;
            }
            
            contrary += 2;
            previousPitch = currentPitch;
            
            // Maintain 4 voices based on voicing type - exactly matching Python logic
            if ((chordWidth === octaveChord && note === 3) || 
                (chordWidth === drop2 && (note === 2 || note === 5)) || 
                (chordWidth === drop3 && (note === 2 || note === 3 || note === 5)) || 
                (chordWidth === drop2and4 && (note === 2 || note === 4 || note === 5 || note === 7)) || 
                (chordWidth === doubleOctaveChord && (note === 2 || note === 3 || note === 5 || note === 7 || note === 8))) {
                continue;
            }
            
            // Add a pitch to the chord
            chord.push(currentPitch);
        }
        
        return chord;
    },
    
    // Implement oblique motion - matching Python implementation
    obliqueMotion(inputPitch) {
        // In Python implementation, oblique motion simply sets the pivot pitch
        // The actual oblique effect happens in the way the accelerometer data is handled
        if (inputPitch !== undefined) {
            this.pivotPitch = inputPitch;
        }
        return [];
    },
    
    // Process motion data into actual notes to play - matching Python implementation logic
    processMotionData(data) {
        // Skip if off
        if (this.offChordLock) {
            return [];
        }
        
        // In Python implementation, pitch (y) controls oblique motion
        // and roll (x) controls contrary motion
        const pitchMotion = data.normalizedPitch;
        const rollMotion = data.normalizedRoll;
        
        // Initialize result chord
        let resultChord = [];
        
        // If both motions are very small, return a basic chord
        if (Math.abs(rollMotion) < 0.05 && Math.abs(pitchMotion) < 0.05) {
            // Use the current scale to build a basic chord (like in Python)
            const scale = this.getCurrentScale();
            // Build a basic triad from the scale
            for (let i = 0; i < 7; i += 2) {
                if (i < scale.length) {
                    resultChord.push(this.scaleRoot + scale[i] + (5 * 12)); // 5th octave
                }
            }
            return resultChord;
        }
        
        // Map roll (x) to contrary motion - this mirrors Python's mapAccelerometerToPitch
        if (Math.abs(rollMotion) > 0.05) {
            const contraryPitch = this.scaleRoot + Math.floor((rollMotion + 1) * 36);
            resultChord = this.contraryMotion(contraryPitch);
        }
        
        // Map pitch (y) to oblique motion - matching Python's handleTouchInput logic
        if (Math.abs(pitchMotion) > 0.05) {
            const obliquePitch = this.scaleRoot + Math.floor((pitchMotion + 1) * 24) + 60;
            this.obliqueMotion(obliquePitch);
            
            // In Python, obliqueMotion just sets pivotPitch
            // The actual oblique motion effect is achieved when the next contrary motion is calculated
        }
        
        return resultChord;
    },
    
    // Reset family transformations
    resetFamilyTransformations() {
        if (this.familyUp) {
            this.makeFamilyDown();
            this.familyUp = false;
        }
        if (this.familyDown) {
            this.makeFamilyUp();
            this.familyDown = false;
        }
        if (this.familyAcross) {
            this.makeFamilyAcross();
            this.familyAcross = false;
        }
    },
    
    // Barry Harris "family" concept implementation
    // Moving between related chords
    
    // Move up the family (e.g., I→iii→V→vii)
    familyUp() {
        this.chordNumeral = ((this.chordNumeral + 1) % 7) || 7;
        this.offChordLock = false;
        return this.chordNumeral;
    },
    
    // Move down the family (e.g., vii→V→iii→I)
    familyDown() {
        this.chordNumeral = this.chordNumeral - 1;
        if (this.chordNumeral < 1) this.chordNumeral = 7;
        this.offChordLock = false;
        return this.chordNumeral;
    },
    
    // Move across the family (related substitutions)
    familyAcross() {
        // Implement Barry Harris' concept of chord family relationships
        // Movement by thirds: I↔vi, ii↔IV, iii↔V, etc.
        const acrossMap = {
            1: 6, // I → vi
            2: 4, // ii → IV
            3: 5, // iii → V
            4: 2, // IV → ii
            5: 3, // V → iii
            6: 1, // vi → I
            7: 5  // vii° → V (common substitution)
        };
        
        this.chordNumeral = acrossMap[this.chordNumeral] || 1;
        this.offChordLock = false;
        return this.chordNumeral;
    },
    
    // Change octave ranges
    octaveUp() {
        this.scaleRoot += 12;
        return this.scaleRoot;
    },
    
    octaveDown() {
        this.scaleRoot -= 12;
        return this.scaleRoot;
    },
    
    // Toggle dominant character
    makeDominant(enable) {
        this.dominant = enable !== undefined ? enable : !this.dominant;
        this.updateCurrentScale();
        return this.dominant;
    },
    
    // Handle chord numerals selection
    handleChordNumeral(numeral) {
        // Reset family transformations
        this.resetFamilyTransformations();
        
        // Set offChordLock to false
        this.offChordLock = false;
        
        // Constants matching Python implementation
        const KEY = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
        const OCTAVE = 12;
        const BASS_OCTAVE_OFFSET = OCTAVE * 3;
        
        // Logic matching the Python implementation's buttonOperations function
        switch(numeral) {
            case 1: // I chord (tonic)
                this.chordNumeral = 1;
                this.bassNote = KEY[0] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[0];
                break;
            case 2: // ii chord
                this.chordNumeral = 2;
                this.bassNote = KEY[1] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[1];
                break;
            case 3: // iii chord
                this.chordNumeral = 3;
                this.bassNote = KEY[2] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[2];
                break;
            case 4: // IV chord
                this.chordNumeral = 4;
                this.bassNote = KEY[3] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[3];
                break;
            case 5: // V chord
                this.chordNumeral = 5;
                this.bassNote = KEY[4] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[4];
                break;
            case 6: // vi chord
                this.chordNumeral = 6;
                this.bassNote = KEY[5] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[5];
                break;
            case 7: // vii° chord (diminished)
                this.chordNumeral = 7;
                this.bassNote = KEY[6] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE';
                this.scaleRoot = KEY[6];
                break;
            case 8: // I chord (tonic) an octave higher
                this.chordNumeral = 8;
                this.bassNote = KEY[0] + BASS_OCTAVE_OFFSET + OCTAVE;
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[0] + OCTAVE;
                break;
            default:
                // Default to I chord if invalid numeral
                this.chordNumeral = 1;
                this.bassNote = KEY[0] + BASS_OCTAVE_OFFSET;
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
                this.scaleRoot = KEY[0];
        }
        
        // If alternate or dominant flags are set, update the scale accordingly
        if (this.alternate) {
            this.makeAlternate(this.chordNumeral);
        }
        
        if (this.dominant) {
            this.makeDominant(true);
        }
        
        return this.chordNumeral;
    },
    
    // Toggle alternate scale
    setAlternate(enable) {
        this.alternate = enable !== undefined ? enable : !this.alternate;
        this.updateCurrentScale();
        return this.alternate;
    },
    
    // Update makeAlternate to match Python's precise logic
    makeAlternate(chordNumeral) {
        const KEY = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
        
        switch(chordNumeral) {
            case 1: // 1 chord alt
            case 8: // 1 chord octave alt
                // the major 6th on the 5
                // Ex: Cmaj6 --> Gmaj6/C (Cmaj9)
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
                this.scaleRoot = KEY[1]; // 2nd degree
                break;
            case 2: // 2 chord alt
                // Ex: Dmin7 --> Cmaj6/D (Dmin11)
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
                this.scaleRoot = KEY[2]; // 3rd degree
                break;
            case 3: // 3 chord alt
                // Ex: Emin7 --> Cmaj6/E
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
                this.scaleRoot = KEY[2]; // 3rd degree
                break;
            case 4: // 4 chord alt
                // Ex: Fmaj6dim --> Cmaj6dim/F (Fmaj9)
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
                this.scaleRoot = KEY[4]; // 5th degree
                break;
            case 5: // 5 chord alt
                // minor 6th on the 5
                // Ex: G7dim --> Dmin6dim/G
                this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
                this.scaleRoot = KEY[5]; // 6th degree
                break;
            case 6: // 6 chord alt
                // Ex: Amin7 --> Gmaj6/A (Amin11)
                this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
                this.scaleRoot = KEY[6]; // 7th degree
                break;
            case 7: // 7 chord alt
                // Ex: Bmin7b5 --> G7/B
                this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD';
                this.scaleRoot = KEY[6]; // 7th degree
                break;
        }
        
        this.alternate = true;
        return this.alternate;
    },
    
    // Toggle "pretty" substitutions
    usePrettySubstitution(enable) {
        this.pretty = enable !== undefined ? enable : !this.pretty;
        return this.pretty;
    },
    
    // Update the current scale based on settings
    updateCurrentScale() {
        // Base scale selection logic from Barry Harris concepts
        if (this.alternate) {
            this.currentScale = this.dominant 
                ? 'DOMINANT_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE' 
                : 'MINOR_SIXTH_DIMINISHED_SCALE';
        } else {
            this.currentScale = this.dominant 
                ? 'DOMINANT_SEVENTH_DIMINISHED_SCALE' 
                : 'MAJOR_SIXTH_DIMINISHED_SCALE';
        }
    },
    
    // Complete family transformation methods from Python
    makeFamilyUp() {
        // Detailed scale transformations for each scale type
        if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
        } else if (this.currentScale === 'MINOR_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        } 
        // Min6 variants
        else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE';
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE';
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        }
        // Dom7 variants
        else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD';
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        }
        
        this.familyUp = true;
        return this.familyUp;
    },
    
    makeFamilyDown() {
        // Detailed scale transformations for each scale type
        if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MINOR_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
        }
        // Min6 variants
        else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE';
        }
        // Dom7 variants
        else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH';
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        }
        
        this.familyDown = true;
        return this.familyDown;
    },
    
    makeFamilyAcross() {
        // Detailed scale transformations for each scale type - tritone relationships
        if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MINOR_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MINOR_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
            this.scaleRoot = this.scaleRoot + 1;
        }
        // Min6 variants
        else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE';
        } else if (this.currentScale === 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE') {
            this.currentScale = 'MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD';
        }
        // Dom7 variants
        else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH';
            this.scaleRoot = this.scaleRoot + 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH';
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE';
            this.scaleRoot = this.scaleRoot - 1;
        } else if (this.currentScale === 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH') {
            this.currentScale = 'DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD';
        }
        
        this.familyAcross = true;
        return this.familyAcross;
    },
    
    // Reset to default scale of chords for the current chord numeral
    makeDefault() {
        this.alternate = false;
        this.dominant = false;
        this.handleChordNumeral(this.chordNumeral);
        return this.chordNumeral;
    },

    // Map accelerometer values to pitch and movement
    mapAccelerometerToPitch(x, y, z) {
        // Ensure x and y are within range (matching Python constraints)
        if (x > 0.0) x = 0.0;
        if (y > 0.0) y = 0.0;
        
        // Map accelerometer range to octave + 1 range, similar to Python
        const xMapped = this.mapValue(x, -1.0, 0.1, 0, 9);
        const yMapped = this.mapValue(y, -1.0, 0.0, 9, 0);
        
        // Handle chord lock mode (similar to Python offChordLock logic)
        let adjustedXMapped = xMapped;
        if (this.offChordLock) {
            // If off chord locked, only play odd scale degrees
            if (adjustedXMapped % 2 === 0) adjustedXMapped += 1;
        } else {
            // If on chord locked, only play even scale degrees
            if (adjustedXMapped % 2 === 1) adjustedXMapped += 1;
        }
        
        // Calculate octave and scale degree (similar to Python)
        const octave = Math.floor(adjustedXMapped / 8) + 4;
        const scaleDegree = adjustedXMapped % 8;
        
        // Get the current scale and convert to actual pitch
        const scale = this.getCurrentScale();
        let pitch = 0;
        
        if (scaleDegree < scale.length) {
            pitch = this.scaleRoot + scale[scaleDegree] + (octave * 12);
        }
        
        return {
            pitch: pitch,
            roll: z, // For contrary motion
            tilt: yMapped // For other motion effects
        };
    },

    // Helper function to map values (equivalent to Python's mapValue)
    mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
};

// Test function - can be removed after testing
function testVoicings() {
    console.log("TESTING CONTRARY MOTION VOICINGS");
    console.log("--------------------------------");
    
    // Save original pivot pitch
    const originalPivot = this.pivotPitch;
    this.pivotPitch = 60; // Set C4 as pivot for testing
    
    const tests = [
      { name: "Unison", input: 60, expected: [60] },
      { name: "Third", input: 59, expected: [59, 62] },
      { name: "Triad", input: 57, expected: [57, 60, 64] },
      { name: "Shell", input: 56, expected: [56, 59, 65] },
      { name: "Octave Chord", input: 55, expected: [55, 60, 64, 67] },
      { name: "Drop 2", input: 53, expected: [53, 59, 62, 68] },
      { name: "Drop 3", input: 52, expected: [52, 60, 67, 69] },
      { name: "Drop 2&4", input: 50, expected: [50, 56, 65, 71] },
      { name: "Double Octave", input: 48, expected: [48, 57, 64, 72] }
    ];
    
    let passed = 0;
    
    tests.forEach(test => {
      const result = this.contraryMotion(test.input);
      console.log(`${test.name}: [${result}] - ${JSON.stringify(result) === JSON.stringify(test.expected) ? "✓" : "✗"}`);
      if (JSON.stringify(result) === JSON.stringify(test.expected)) passed++;
    });
    
    console.log(`\nPassed ${passed}/${tests.length} tests`);
    
    // Restore original pivot pitch
    this.pivotPitch = originalPivot;
  }
  
  // Add this method to ChordTheory
  ChordTheory.testVoicings = testVoicings;

// Export as global if not using modules
window.ChordTheory = ChordTheory; 