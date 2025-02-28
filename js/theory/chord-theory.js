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
    
    // Implement contrary motion - full Python implementation
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
        
        // Find scale degrees - directly using indexOf instead of manual search
        const inputScaleDegree = scale.indexOf(inputPitchClass);
        const pivotScaleDegree = scale.indexOf(pivotPitchClass);
        
        // If either pitch is not in scale, return empty chord
        if (inputScaleDegree === -1 || pivotScaleDegree === -1) {
            return [];
        }
        
        const inputOctave = Math.floor(contraryPitch / OCTAVE);
        const octaveSpread = Math.floor(Math.abs(contraryPitch - this.pivotPitch) / OCTAVE);
        
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
        let currentOctave = inputOctave;
        let previousPitch = contraryPitch;
        
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
    
    // Implement oblique motion
    obliqueMotion(normalizedPitch) {
        // In Barry Harris theory, oblique motion keeps some voices static while others move
        if (normalizedPitch === undefined) {
            // If no pitch is provided, set the pivot pitch
            this.pivotPitch = normalizedPitch;
            return [];
        }
        
        const chord = [];
        const intensity = Math.abs(normalizedPitch);
        
        // Get basic chord from current numeral
        const baseNotes = this.getScaleDegreeNotes(this.chordNumeral);
        if (baseNotes.length === 0) return [];
        
        // Keep the outer voices (bass and soprano) static
        chord.push(baseNotes[0]); // Bass stays
        
        // Middle voices move based on pitch intensity
        const middleVoiceCount = baseNotes.length - 2;
        if (middleVoiceCount > 0) {
            const pitchDirection = Math.sign(normalizedPitch);
            const maxMotion = 7; // Max movement of a fifth
            
            for (let i = 1; i < baseNotes.length - 1; i++) {
                // Calculate oblique motion amount for each middle voice
                // Distribute motion across middle voices
                const voiceRatio = i / (middleVoiceCount + 1);
                const voiceMotion = pitchDirection * Math.round(intensity * maxMotion * voiceRatio);
                chord.push(baseNotes[i] + voiceMotion);
            }
        }
        
        // Soprano stays
        chord.push(baseNotes[baseNotes.length - 1]);
        
        return chord;
    },
    
    // Process motion data into actual notes to play
    processMotionData(data) {
        // Skip if off
        if (this.offChordLock) {
            return [];
        }
        
        // Use both contrary and oblique motion, but weight their influence
        // based on the strength of each motion
        const contraryInfluence = Math.abs(data.normalizedRoll);
        const obliqueInfluence = Math.abs(data.normalizedPitch);
        
        // Get base voicings
        const contraryChord = this.contraryMotion(data.normalizedRoll);
        const obliqueChord = this.obliqueMotion(data.normalizedPitch);
        
        // If no movement, return the basic chord
        if (contraryInfluence < 0.05 && obliqueInfluence < 0.05) {
            return this.getScaleDegreeNotes(this.chordNumeral);
        }
        
        // Choose which motion dominates based on strength
        if (contraryInfluence > obliqueInfluence) {
            return contraryChord;
        } else {
            return obliqueChord;
        }
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

// Export as global if not using modules
window.ChordTheory = ChordTheory; 