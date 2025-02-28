// Accelerometer handling
class MotionSensor {
    constructor() {
        this.isSupported = window.DeviceMotionEvent !== undefined;
        this.isRunning = false;
        this.callback = null;
        this.accelerationData = { x: 0, y: 0, z: 0 };
        this.rotationData = { alpha: 0, beta: 0, gamma: 0 };
        
        // Bind methods
        this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
        this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    }
    
    async requestPermission() {
        if (!this.isSupported) {
            console.error('Device motion not supported');
            return false;
        }
        
        // iOS 13+ requires permission
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                return permissionState === 'granted';
            } catch (error) {
                console.error('Error requesting device motion permission:', error);
                return false;
            }
        }
        
        // For other browsers that don't require permission
        return true;
    }
    
    start(callback) {
        if (!this.isSupported) {
            console.error('Device motion not supported');
            return false;
        }
        
        this.callback = callback;
        this.isRunning = true;
        
        window.addEventListener('devicemotion', this.handleDeviceMotion);
        window.addEventListener('deviceorientation', this.handleDeviceOrientation);
        
        return true;
    }
    
    stop() {
        this.isRunning = false;
        window.removeEventListener('devicemotion', this.handleDeviceMotion);
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    }
    
    handleDeviceMotion(event) {
        if (!this.isRunning) return;
        
        this.accelerationData = {
            x: event.accelerationIncludingGravity.x || 0,
            y: event.accelerationIncludingGravity.y || 0,
            z: event.accelerationIncludingGravity.z || 0
        };
        
        this.processData();
    }
    
    handleDeviceOrientation(event) {
        if (!this.isRunning) return;
        
        this.rotationData = {
            alpha: event.alpha || 0, // Z-axis rotation [0,360)
            beta: event.beta || 0,   // X-axis rotation [-180,180)
            gamma: event.gamma || 0  // Y-axis rotation [-90,90)
        };
        
        this.processData();
    }
    
    processData() {
        if (this.callback) {
            // Calculate roll (x-axis rotation) and pitch (y-axis rotation)
            // Note: These may need calibration for different devices
            const roll = this.rotationData.gamma; // Side-to-side tilt
            const pitch = this.rotationData.beta;  // Front-to-back tilt
            
            // Normalize values for our musical application
            // These ranges may need adjustment based on testing
            const normalizedRoll = this.mapValue(roll, -90, 90, -1, 1);
            const normalizedPitch = this.mapValue(pitch, -180, 180, -1, 1);
            
            this.callback({
                acceleration: this.accelerationData,
                rotation: this.rotationData,
                roll: roll,
                pitch: pitch,
                normalizedRoll: normalizedRoll,
                normalizedPitch: normalizedPitch
            });
        }
    }
    
    mapValue(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
}

// Export as global if not using modules
window.MotionSensor = MotionSensor;

// Device motion handler implementation
function startAccelerometerListener(callback) {
    // Check if DeviceOrientation is available
    if (!window.DeviceOrientationEvent) {
        console.error('DeviceOrientation not supported by your browser');
        return null;
    }
    
    console.log('Setting up real device orientation listener');
    
    // Create an object to track motion data
    const motionData = {
        roll: 0,        // Rotation around X (gamma)
        pitch: 0,       // Rotation around Y (beta)
        // Normalized values will be added when calculating
    };
    
    // Last update timestamp for throttling
    let lastUpdateTime = 0;
    const updateInterval = 50; // milliseconds
    
    // Listen for orientation changes
    window.addEventListener('deviceorientation', handleOrientation);
    
    function handleOrientation(event) {
        // Basic throttling to prevent too many updates
        const now = Date.now();
        if (now - lastUpdateTime < updateInterval) {
            return;
        }
        lastUpdateTime = now;
        
        // Get values from event
        // iOS and Android have different conventions
        motionData.roll = event.gamma || 0;  // Left/right tilt: -90 to 90
        motionData.pitch = event.beta || 0;  // Front/back tilt: -180 to 180
        
        // Constrain values to reasonable ranges
        motionData.roll = Math.min(90, Math.max(-90, motionData.roll));
        motionData.pitch = Math.min(90, Math.max(-90, motionData.pitch));
        
        // Add normalized values (between -1 and 1)
        motionData.normalizedRoll = motionData.roll / 90;  
        motionData.normalizedPitch = motionData.pitch / 90;
        
        // Log raw values occasionally for debugging
        if (Math.random() < 0.05) { // Log ~5% of the events to avoid console flood
            console.log('Raw device orientation:', 
                        'gamma (roll):', event.gamma, 
                        'beta (pitch):', event.beta, 
                        'alpha (yaw):', event.alpha);
        }
        
        // Send data to callback
        callback(motionData);
    }
    
    // Return a cleanup function
    return function cleanup() {
        window.removeEventListener('deviceorientation', handleOrientation);
        console.log('Device orientation listener removed');
    };
}

// Export for global access
window.startAccelerometerListener = startAccelerometerListener; 