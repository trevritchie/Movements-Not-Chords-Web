# Voicings

## MNC Voicing System Notes

The MNC application uses a unique approach to chord voicing:

1. **Scale-Based Chord Generation**: Rather than traditional chord construction, MNC uses 8-note "scales of chords" (diminished scales from different positions) to generate chord tones.

2. **Voicing Types**:
   - these examples are like oblique motion, if the roll is not changing, since c remains as the base note  
   - Examples below all have C4 as the lowest note, and are all from C MAJOR_SIXTH_DIMINISHED_SCALE
   - **Unison voicing**: 1-note (C4)
   - **Third voicing**: 2-note (C4-E4)
   - **Triad voicing**: Basic 3-note chord (C4-E4-G4)
   - **Shell voicing**: 3 notes (C4-E4-A4)
   - **Octave voicing**: 4-note voicing spanning approximately an octave (C4-E4-A4-C5)
   - **Drop 2 voicing**: 4-note voicing where the second highest note is dropped an octave(C4-G4-A4-E5)
   - **Drop 3 voicing**: 4-note voicing where the third highest note is dropped an octave(C4-A4-E5-G5)
   - **Drop 2&4 voicing**: 4-note voicing where both the second and fourth highest notes are dropped(C4-G4-E5-A5)
   - **Double octave voicing**: 4-note voicing spanning two octaves (C4-A4-E5-C6)

3. **Chord Width Parameters**:
   - `octaveChord = 5`: 5-note chord spanning an octave
   - `drop2 = 6`: 6-note structure with drop 2 voicing pattern
   - `drop3 = 7`: 7-note structure with drop 3 voicing pattern
   - `drop2and4 = 8`: 8-note structure with both 2nd and 4th notes dropped
   - `doubleOctaveChord = 9`: 9-note structure spanning two octaves

4. **Voice Construction**: The `contraryMotion` function builds chords using a "take a note, skip a note" approach, selecting alternating scale degrees from the current scale of chords.

5. **Consistent 4-Voice Output**: Although internal calculations may work with larger structures, the system maintains 4-voice output for optimal harmonic clarity.

6. **Importance of Voicing Continuity**: When transitioning between chords, maintaining voicing type (drop 2, etc.) can be as important as minimizing voice movement for musical coherence.

## Contrary Motion Examples

The following examples demonstrate how the `contraryMotion()` function builds chords from a central pivot pitch (C4) by expanding outward in contrary motion. This shows how the system generates different voicing types by using "take a note, skip a note" pattern from the scale:

**Starting from C4 as pivot pitch in C Major Sixth Diminished Scale [0, 2, 4, 5, 7, 8, 9, 11]:**

- **Unison voicing**: C4 (60)
  - When the contraryPitch equals pivotPitch, only a single note sounds

- **Third voicing**: B3 (59) D4 (62)
  - Notes expand outward from pivot pitch - one step down, one step up
  - Using alternating scale degrees (skip one, take one)

- **Triad voicing**: A3 (57) C4 (60) E4 (64)
  - Further expansion - notice how we're taking alternating scale degrees
  - Voice spacing increases as we move further from pivot

- **Shell voicing**: G#3 (56) B3 (59) F4 (65)

- **Octave voicing**: G3 (55) C4 (60) E4 (64) G4 (67)
  - Spans approximately an octave
  - Maintains 4-voice texture with balanced spacing

- **Drop 2 voicing**: F3 (53) B3 (59) D4 (62) G#4 (68)
  - Similar to close voicing but with second voice "dropped" down
  - Notice pattern of alternating scale degrees

- **Drop 3 voicing**: E3 (52) C4 (60) G4 (67) A4 (69)
  - Third voice from top is dropped, creating wider intervals

- **Drop 2&4 voicing**: D3 (50) G#3 (56) F4 (65) B4 (71)
  - Both second and fourth voices from top are dropped
  - Creates more open sound while maintaining contrary motion pattern

- **Double octave voicing**: C3 (48) A3 (57) E4 (64) C5 (72)
  - Furthest expansion from pivot note C4
  - Spans two octaves with carefully selected notes from the scale

This demonstrates how the `contraryMotion()` function systematically builds different voicing types by starting from a pivot pitch and expanding outward using alternating scale degrees. The function adjusts which voices are included based on the chord width parameter to create the specific voicing types (close, drop2, drop3, etc.).