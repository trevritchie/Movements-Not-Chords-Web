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

// Helper function to start the accelerometer with a callback
function startAccelerometerListener(callback) {
    const motionSensor = new MotionSensor();
    
    motionSensor.requestPermission().then(granted => {
        if (granted) {
            console.log('Motion permission granted, starting sensor');
            motionSensor.start(callback);
            
            // Remove simulation code
            // Instead add a fallback for desktop testing
            if (!window.DeviceMotionEvent) {
                console.warn('Device motion not supported, using simulation');
                // Only use simulation if real sensors aren't available
                simulateMotionData(callback);
            }
        } else {
            console.error('Motion permission denied');
            alert('This app requires motion sensor access to work properly.');
        }
    });
    
    return motionSensor;
}

// Add this function for desktop testing
function simulateMotionData(callback) {
    console.log('Using simulated motion data');
    setInterval(() => {
        callback({
            roll: Math.random() * 90 - 45,  // -45 to 45
            pitch: Math.random() * 90 - 45,  // -45 to 45
            normalizedRoll: Math.random() * 2 - 1, // -1 to 1
            normalizedPitch: Math.random() * 2 - 1 // -1 to 1
        });
    }, 100);
}

// Export as global if not using modules
window.startAccelerometerListener = startAccelerometerListener; 