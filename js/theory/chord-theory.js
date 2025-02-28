// Barry Harris Chord Theory Implementation
// Based on the original mnc.py implementation

// Enhanced ChordTheory object
const ChordTheory = {
    // Match Python variable names
    scaleOfChords: Scales.MAJOR_SIXTH_DIMINISHED_SCALE, // Same as currentScale
    scaleOfChordsRoot: 60, // Same as scaleRoot
    pivotPitch: 60, // C4 as in Python
    chordNumeral: 1,
    offChordLock: false,
    alternate: false,
    dominant: false,
    pretty: false,
    familyUp: false,
    familyDown: false,
    familyAcross: false,
    bassNote: 48, // Bass C
    
    // Get current scale (renamed to match Python)
    getScaleOfChords() {
        return this.scaleOfChords;
    },
    
    // Set scale of chords (matching Python setScaleOfChords)
    setScaleOfChords(scale) {
        this.scaleOfChords = scale;
    },
    
    // Set root of scale (matching Python)
    setScaleOfChordsRoot(root) {
        this.scaleOfChordsRoot = root;
    },

    // Button handlers - matching Python exactly
    
    // Handle chord numerals
    tonic() {
        this.chordNumeral = 1;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
        this.offChordLock = false;
        return 1;
    },
    
    supertonic() {
        this.chordNumeral = 2;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
        this.offChordLock = false;
        return 2;
    },
    
    mediant() {
        this.chordNumeral = 3;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
        this.offChordLock = false;
        return 3;
    },
    
    subdominant() {
        this.chordNumeral = 4;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_SIXTH);
        this.offChordLock = false;
        return 4;
    },
    
    dominant() {
        this.chordNumeral = 5;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
        this.offChordLock = false;
        return 5;
    },
    
    submediant() {
        this.chordNumeral = 6;
        this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
        this.offChordLock = false;
        return 6;
    },
    
    leading() {
        this.chordNumeral = 7;
        this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
        this.offChordLock = false;
        return 7;
    },
    
    tonicOctave() {
        return this.tonic(); // Same as I but octave higher
    },
    
    // Special buttons - matching Python
    makeOffChord() {
        this.offChordLock = true;
        return "Off";
    },
    
    makeOnChord() {
        this.offChordLock = false;
        return "On";
    },
    
    // Handle special functions - matching Python
    makeDominant() {
        this.dominant = !this.dominant;
        
        // Same logic as Python for scale transformations
        if (this.dominant) {
            if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
            } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH);
            } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_SIXTH) {
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH);
            } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE) {
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 4);
            }
        } else {
            // Restore non-dominant scale
            if (this.chordNumeral === 1) this.tonic();
            else if (this.chordNumeral === 2) this.supertonic();
            else if (this.chordNumeral === 3) this.mediant();
            else if (this.chordNumeral === 4) this.subdominant();
            else if (this.chordNumeral === 5) this.dominant();
            else if (this.chordNumeral === 6) this.submediant();
            else if (this.chordNumeral === 7) this.leading();
        }
        
        return this.dominant ? "Dominant" : "Not Dominant";
    },
    
    // Pretty substitution - matching Python
    prettySubstitution() {
        this.pretty = !this.pretty;
        
        if (this.pretty) {
            // Apply pretty substitution (similar to Python)
            if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 4);
            }
            // Add other pretty substitution logic from Python...
        } else {
            // Restore normal scale
            this.makeDefault();
        }
        
        return this.pretty ? "Pretty" : "Not Pretty";
    },
    
    // Barry Harris "family" concept implementation - matching Python
    makeFamilyUp() {
        this.familyUp = true;
        
        // Logic from Python for family up
        if (this.chordNumeral === 1) this.mediant();
        else if (this.chordNumeral === 3) this.dominant();
        else if (this.chordNumeral === 5) this.leading();
        else if (this.chordNumeral === 7) this.tonic();
        
        return "Family Up";
    },
    
    makeFamilyDown() {
        this.familyDown = true;
        
        // Logic from Python for family down
        if (this.chordNumeral === 7) this.dominant();
        else if (this.chordNumeral === 5) this.mediant();
        else if (this.chordNumeral === 3) this.tonic();
        else if (this.chordNumeral === 1) this.leading();
        
        return "Family Down";
    },
    
    makeFamilyAcross() {
        this.familyAcross = true;
        
        // Logic from Python for family across
        if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
        }
        // Add the remaining logic from Python...
        
        return "Family Across";
    },
    
    // Reset to default scale of chords for the current chord numeral - matching Python
    makeDefault() {
        this.alternate = false;
        this.dominant = false;
        this.pretty = false;
        
        // Call appropriate function based on chord numeral
        if (this.chordNumeral === 1) this.tonic();
        else if (this.chordNumeral === 2) this.supertonic();
        else if (this.chordNumeral === 3) this.mediant();
        else if (this.chordNumeral === 4) this.subdominant();
        else if (this.chordNumeral === 5) this.dominant();
        else if (this.chordNumeral === 6) this.submediant();
        else if (this.chordNumeral === 7) this.leading();
        
        return "Default";
    },
    
    // Handle button press (similar to Python's buttonOperations)
    handleButtonPress(buttonName) {
        switch (buttonName) {
            case "I": return this.tonic();
            case "ii": return this.supertonic();
            case "iii": return this.mediant();
            case "IV": return this.subdominant();
            case "V": return this.dominant();
            case "vi": return this.submediant();
            case "vii": return this.leading();
            case "I_octave": return this.tonicOctave();
            case "off": return this.makeOffChord();
            case "on": return this.makeOnChord();
            case "dom": return this.makeDominant();
            case "pretty": return this.prettySubstitution();
            case "fam_up": return this.makeFamilyUp();
            case "fam_down": return this.makeFamilyDown();
            case "fam_across": return this.makeFamilyAcross();
            default: return null;
        }
    },
    
    // The core contrary motion function (keep our working implementation)
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
        const scale = this.getScaleOfChords();
        const inputPitchClass = (contraryPitch - this.scaleOfChordsRoot) % OCTAVE;
        const pivotPitchClass = (this.pivotPitch - this.scaleOfChordsRoot) % OCTAVE;
        
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
                                this.scaleOfChordsRoot + 
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
    
    // Process motion data into actual notes to play
    processMotionData(data) {
        // Skip if off chord lock is enabled
        if (this.offChordLock) {
            return [];
        }
        
        // Only use positive roll (tilting left) and negative pitch (tilting forward)
        // This matches the Python behavior
        const roll = Math.max(0, data.normalizedRoll || 0);  
        const pitch = Math.min(0, data.normalizedPitch || 0);
        
        // Initialize result chord
        let resultChord = [];
        
        // Small motion case - return a basic chord
        if (Math.abs(roll) < 0.05 && Math.abs(pitch) < 0.05) {
            // Use the current scale to build a basic chord
            const scale = this.getScaleOfChords();
            for (let i = 0; i < 7; i += 2) {
                if (i < scale.length) {
                    resultChord.push(this.scaleOfChordsRoot + scale[i] + (5 * 12));
                }
            }
            return resultChord;
        }
        
        // Handle contrary motion (roll/x-axis) - EXACTLY like Python
        if (Math.abs(roll) > 0.05) {
            // Map roll to a pitch value (0-72 range in Python)
            // For contrary motion, smaller pitch = wider voicing
            const contraryPitch = this.pivotPitch - Math.floor(roll * 72);
            resultChord = this.contraryMotion(contraryPitch);
            return resultChord;
        }
        
        // Handle oblique motion (pitch/y-axis) - EXACTLY like Python
        if (Math.abs(pitch) > 0.05) {
            // Map pitch to pivot pitch adjustment
            // In Python, this sets the pivot for future contrary motion
            const newPivotPitch = this.scaleOfChordsRoot + Math.floor((pitch + 1) * 24) + 60;
            this.pivotPitch = newPivotPitch;
            
            // Return a basic chord for now - the real effect happens on the next contrary motion
            const scale = this.getScaleOfChords();
            for (let i = 0; i < 7; i += 2) {
                if (i < scale.length) {
                    resultChord.push(this.scaleOfChordsRoot + scale[i] + (5 * 12));
                }
            }
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
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
                this.setScaleOfChordsRoot(KEY[1]); // 2nd degree
                break;
            case 2: // 2 chord alt
                // Ex: Dmin7 --> Cmaj6/D (Dmin11)
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(KEY[2]); // 3rd degree
                break;
            case 3: // 3 chord alt
                // Ex: Emin7 --> Cmaj6/E
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(KEY[2]); // 3rd degree
                break;
            case 4: // 4 chord alt
                // Ex: Fmaj6dim --> Cmaj6dim/F (Fmaj9)
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
                this.setScaleOfChordsRoot(KEY[4]); // 5th degree
                break;
            case 5: // 5 chord alt
                // minor 6th on the 5
                // Ex: G7dim --> Dmin6dim/G
                this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
                this.setScaleOfChordsRoot(KEY[5]); // 6th degree
                break;
            case 6: // 6 chord alt
                // Ex: Amin7 --> Gmaj6/A (Amin11)
                this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(KEY[6]); // 7th degree
                break;
            case 7: // 7 chord alt
                // Ex: Bmin7b5 --> G7/B
                this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
                this.setScaleOfChordsRoot(KEY[6]); // 7th degree
                break;
        }
        
        this.alternate = true;
        return this.alternate;
    },
    
    // Update the current scale based on settings
    updateCurrentScale() {
        // Base scale selection logic from Barry Harris concepts
        if (this.alternate) {
            this.setScaleOfChords(this.dominant ? Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE : Scales.MINOR_SIXTH_DIMINISHED_SCALE);
        } else {
            this.setScaleOfChords(this.dominant ? Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE : Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
        }
    },
    
    // Complete family transformation methods from Python
    makeFamilyUp() {
        // Detailed scale transformations for each scale type
        if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_DIMINISHED_SCALE);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } 
        // Min6 variants
        else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        }
        // Dom7 variants
        else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        }
        
        this.familyUp = true;
        return this.familyUp;
    },
    
    makeFamilyDown() {
        // Detailed scale transformations for each scale type
        if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
        }
        // Min6 variants
        else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
        }
        // Dom7 variants
        else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        }
        
        this.familyDown = true;
        return this.familyDown;
    },
    
    makeFamilyAcross() {
        // Detailed scale transformations for each scale type - tritone relationships
        if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MAJOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        }
        // Min6 variants
        else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE);
        } else if (this.scaleOfChords === Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.MINOR_SEVENTH_FLAT_FIVE_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.MINOR_SIXTH_DIMINISHED_SCALE_FROM_THIRD);
        }
        // Dom7 variants
        else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot + 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_FIFTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE);
            this.setScaleOfChordsRoot(this.scaleOfChordsRoot - 1);
        } else if (this.scaleOfChords === Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_SEVENTH) {
            this.setScaleOfChords(Scales.DOMINANT_SEVENTH_DIMINISHED_SCALE_FROM_THIRD);
        }
        
        this.familyAcross = true;
        return this.familyAcross;
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
        const scale = this.getScaleOfChords();
        let pitch = 0;
        
        if (scaleDegree < scale.length) {
            pitch = this.scaleOfChordsRoot + scale[scaleDegree] + (octave * 12);
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