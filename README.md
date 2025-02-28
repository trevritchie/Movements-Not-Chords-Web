# Movements, Not Chords - Web Edition

A web-based musical instrument that lets you create beautiful polyphonic movements using your smartphone's motion sensors.

## About

Movements, Not Chords (MNC) is a musical instrument for polyphonic motion. People of any experience level can play intricate music just by moving their smartphone. By tapping the screen and tilting your phone, you can play beautiful polyphonic movements in contrary and oblique motion.

This web application is based on the musical theory of Dr. Barry Harris and implements 8-note "scales of chords" that allow for infinite contrary motion between "on" and "off" chords.

## How to Play

1. Hold your phone in portrait mode with your dominant hand
2. Tap the buttons on screen with your non-dominant hand to select chord types
3. Tilt your phone to create movement within the selected chord:
   - Roll (side-to-side tilt) creates contrary motion
   - Pitch (front-to-back tilt) creates oblique motion

## Development

This project uses:
- Vanilla JavaScript with Web Components
- Tone.js for audio synthesis
- Tonal.js for music theory calculations
- Web standard APIs for device motion and touch events

## Setup

1. Clone this repository
2. Open `index.html` in a web browser (must be served via HTTPS for device motion to work)
3. For local development, use a tool like `python -m http.server` or any local server

Note: Device motion APIs require HTTPS and permission from the user, so the app must be accessed over a secure connection.

## License

MIT 