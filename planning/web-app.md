# MNC Web App Conversion Plan

## Project: Movements, Not Chords - Web Edition

This document outlines a comprehensive plan to convert "Movements, Not Chords" from a JythonMusic application to a browser-based web application that can be hosted on GitHub Pages.

---

## 1. Overview

### Current Implementation
"Movements, Not Chords" is a musical instrument application built with JythonMusic, played through touch and accelerometer inputs from the TouchOSC mobile app. It implements a sophisticated chord theory system based on Barry Harris' approach, allowing musicians to create complex harmonic progressions through physical movements.

### Vision for Web Conversion
Transform this application into a standalone web app that runs directly in a mobile browser, eliminating the need for TouchOSC, Jython installation, and computer-to-phone communication. The app will directly access device accelerometer data and generate audio through the Web Audio API.

---

## 2. System Architecture Comparison

### Current Architecture

```
[Mobile Device w/ TouchOSC] --OSC Messages--> [Computer running JythonMusic]
                                                       |
                                                       v
                                               [MIDI Sound Output]
```

- **Input Layer**: TouchOSC mobile app sends OSC messages
- **Processing Layer**: JythonMusic application processes musical theory logic
- **Output Layer**: MIDI sounds generated through JythonMusic libraries

### Web App Architecture
```
[Mobile Device Browser]
      |
      | Device APIs (Touch, DeviceMotion)
      v
[JavaScript Application]
      |
      | Web Audio API
      v
[Audio Output]
```

- **Input Layer**: Direct browser access to touchscreen and accelerometer
- **Processing Layer**: JavaScript implementation of musical theory logic
- **Output Layer**: Web Audio API for sound synthesis

---

## 3. Technical Requirements

### Dependencies
- **Framework**: Vanilla JS or lightweight framework (e.g., Preact)
- **Audio**: Web Audio API
- **UI**: HTML5 Canvas or SVG for interactive elements
- **Device APIs**: DeviceMotion API, Touch Events API
- **Deployment**: GitHub Pages

### Browser Requirements
- Modern browsers with Web Audio API support
- iOS 14.5+ or Android 8.0+ for reliable DeviceMotion API access
- HTTPS requirement for device sensor access

### Recommended Tools
- **Core Implementation**: 
  - Vanilla JS + Web Components for lightweight, no-build approach
  - Alternative: Preact (3KB React alternative) with Vite for structured development
  
- **Audio Processing**:
  - Tone.js: Comprehensive library for working with Web Audio API in a musical context
  - Tonal.js: Music theory library for scales, chords, and progressions
  - Soundfont-Player: For realistic instrument sounds similar to MIDI

- **UI/UX Development**:
  - Hammer.js or ZingTouch for gesture recognition
  - Shoelace or vanilla web components for UI elements
  - Canvas API for visualizations

- **Sensor Access**:
  - Native DeviceMotion API with simple wrapper for cross-browser compatibility
  - Permission API for handling sensor access requests

- **Build & Deployment**:
  - Vite or Parcel for development and bundling
  - GitHub Actions for automated deployment to GitHub Pages
  - Cypress and Jest for testing

---

## 4. Implementation Phases

### Phase 1: Foundation Setup (2 weeks)
- Create project structure and GitHub repository
- Implement basic UI layout with touch zones
- Configure DeviceMotion permission request
- Set up Web Audio API foundation
- Develop sound generator modules for different instruments

### Phase 2: Core Music Logic Conversion (3 weeks)
- Convert scale and chord definitions
- Implement mapAccelerometerToPitch function
- Port contraryMotion and obliqueMotion algorithms
- Create button handling logic
- Implement chord numeral system

### Phase 3: Advanced Features (2 weeks)
- Add chord transformations (alternate, dominant, etc.)
- Implement family transformations
- Create decay and sustain effects
- Add visual feedback for interactions

### Phase 4: Optimization & Testing (2 weeks)
- Address latency issues
- Optimize for mobile performance
- Cross-device testing
- Add offline capability via service worker

### Phase 5: Deployment & Documentation (1 week)
- Deploy to GitHub Pages
- Create user documentation
- Add performance instructions
- Implement analytics for feedback

---

## 5. Key Challenges & Solutions

### Audio Latency
- **Challenge**: Web Audio can have higher latency than MIDI
- **Solution**: Use AudioWorklet for more precise timing, pre-load sounds, minimize processing in audio path

### Device Compatibility
- **Challenge**: Inconsistent accelerometer implementations across devices
- **Solution**: Create device-specific calibration process, normalize sensor data

### Permission Requirements
- **Challenge**: Browsers require explicit permission for sensor access
- **Solution**: Clear onboarding process explaining permissions, fallback mode for devices without sensors

### Music Theory Complexity
- **Challenge**: Translating sophisticated chord theory to JavaScript
- **Solution**: Create modular music theory library, unit test against original implementation

---

## 6. Testing Strategy

### Unit Testing
- Test musical theory functions for accuracy
- Verify chord generation matches original implementation

### Integration Testing
- Test accelerometer data processing pipeline
- Validate button interaction flows

### Device Testing
- Test on multiple iOS and Android devices
- Verify performance on different screen sizes
- Test with various audio output methods (speakers, headphones)

### User Testing
- Recruit musicians familiar with the original app
- Conduct A/B comparison with original application

---

## 7. Performance Considerations

### Audio Performance
- Minimize garbage collection during audio processing
- Use AudioBuffers for deterministic timing
- Implement audio worklets for time-critical operations

### Touch Responsiveness
- Optimize touch event handlers
- Use passive event listeners where appropriate
- Implement debouncing for accelerometer data

### Battery Usage
- Throttle accelerometer sampling when appropriate
- Optimize rendering cycles
- Suspend audio context when app is in background

---

## 8. Timeline and Milestones

| Milestone | Timeframe | Deliverables |
|-----------|-----------|--------------|
| Project Setup | Week 1 | Repository, basic structure, permissions handling |
| Sound Engine | Week 2-3 | Web Audio implementation, instrument sounds |
| Core Music Logic | Week 4-6 | Scale/chord system, motion algorithms |
| UI Implementation | Week 7-8 | Interactive interface, visual feedback |
| Testing & Optimization | Week 9-10 | Cross-device compatibility, performance tuning |
| Final Release | Week 11 | Deployed app, documentation |

---

## 9. Future Enhancements

- Custom sound design interface
- User presets for scales and tuning
- MIDI output capability for DAW integration
- Collaborative jamming features
- Audio recording and export

---

## 10. GitHub Pages Deployment Strategy

### Repository Structure
- Use a dedicated repository for the project
- Configure GitHub Pages to deploy from the main branch or a dedicated gh-pages branch

### Automated Deployment
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install and Build
        run: |
          npm install
          npm run build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: dist
```

### Offline Capabilities
- Implement service worker for offline access
- Cache important audio assets and application logic

## 11. Chord Voicing System

A key element of "Movements, Not Chords" is the dynamic chord voicing system, which creates musically coherent chord expansions based on Barry Harris' approach. This section explains the core mechanism of the voicing system.

### Contrary Motion: From Unison to Complex Voicings

The contrary motion algorithm takes physical movement and translates it into harmonically rich chord voicings. As the distance between input pitch and pivot increases, the algorithm creates progressively more complex voicings, with notes expanding outward in contrary motion.

```
Input Pitch → Distance from Pivot → Chord Width Calculation → Voicing Selection → Note Selection
```

#### Voicing Progression in C Major Sixth Diminished Scale [C D E F G Ab A B]

Starting with a pivot pitch and moving the input pitch progressively farther away:

1. **Unison (Width 1)**:
   - When input equals pivot
   - Result: Single note
   - C4 (MIDI 60)
   - *Single pivot pitch*

2. **Third (Width 2)**:
   - Input pitch slightly below pivot
   - Result: Two-note voicing
   - B3 (MIDI 59), D4 (MIDI 62)
   - *Basic interval with octave spacing*

3. **Triad (Width 3)**:
   - Input progressively lower
   - Result: Three-note voicing
   - A3 (MIDI 57), C4 (MIDI 60), E4 (MIDI 64)
   - *Major triad voicing*

4. **Shell (Width 4)**:
   - Input progressively lower
   - Result: Three-note voicing
   - G#3 (MIDI 56), B3 (MIDI 59), F4 (MIDI 65)
   - *Chord shell with essential tones*

5. **Octave Chord (Width 5)**:
   - Input progressively lower
   - Result: Four-note voicing (skips 3rd note)
   - G3 (MIDI 55), C4 (MIDI 60), E4 (MIDI 64), G4 (MIDI 67)
   - *Four-voice spread voicing spanning an octave*

6. **Drop 2 Voicing (Width 6)**:
   - Input progressively lower
   - Result: Four-note voicing (skips notes 2 & 5)
   - F3 (MIDI 53), B3 (MIDI 59), D4 (MIDI 62), G#4 (MIDI 68)
   - *Four-voice chord with 2nd voice from top dropped an octave*

7. **Drop 3 Voicing (Width 7)**:
   - Input progressively lower
   - Result: Four-note voicing (skips notes 2, 3 & 5)
   - E3 (MIDI 52), C4 (MIDI 60), G4 (MIDI 67), A4 (MIDI 69)
   - *Four-voice chord with 3rd voice from top dropped an octave*

8. **Drop 2&4 Voicing (Width 8)**:
   - Input progressively lower
   - Result: Four-note voicing (skips notes 2, 4, 5 & 7)
   - D3 (MIDI 50), G#3 (MIDI 56), F4 (MIDI 65), B4 (MIDI 71)
   - *Four-voice chord with 2nd and 4th voices dropped*

9. **Double Octave Chord (Width 9)**:
   - Input furthest below pivot
   - Result: Four-note voicing (skips notes 2, 3, 5, 7 & 8)
   - C3 (MIDI 48), A3 (MIDI 57), E4 (MIDI 64), C5 (MIDI 72)
   - *Four-voice chord spanning exactly two octaves*

### Voicing Logic and Contrary Motion Pattern

The algorithm creates these voicings by:
1. Calculating chord width based on distance between input and pivot pitches
2. Starting from the input pitch and moving up in specified intervals
3. Skipping specific notes based on the desired voicing type
4. Creating contrary motion where one voice moves down and another up with each expansion

As the chord expands from unison to double octave:
- The bottom note descends by approximately one scale step each time (60→50→57→56→55→53→52→50→48)
- The top note generally ascends (60→62→64→65→67→68→69→71→72)
- The inner voices create musically coherent harmonies

```javascript
// The core of the voicing system is this skipping logic:
if ((chordWidth === octaveChord && note === 3) ||
    (chordWidth === drop2 && (note === 2 || note === 5)) ||
    (chordWidth === drop3 && (note === 2 || note === 3 || note === 5)) ||
    (chordWidth === drop2and4 && (note === 2 || note === 4 || note === 5 || note === 7)) ||
    (chordWidth === doubleOctaveChord && (note === 2 || note === 3 || note === 5 || note === 7 || note === 8))) {
    continue; // Skip this note in the voicing
}
```

This sophisticated system creates musically satisfying voice leading as the chord expands and contracts with physical movement, maintaining the essence of Barry Harris' approach to harmony.

### Implementation Considerations

1. **Optimization**: The voicing calculation is performance-critical and should be optimized for minimal latency
2. **Calibration**: Different devices may require adjustments to the motion mapping
3. **Visualization**: Consider visual feedback showing chord expansion/contraction
4. **Scale Context**: Voicings sound different in different scales/contexts
