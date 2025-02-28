// Test to verify chord voicing implementation matches the examples
// Run this test in browser console or Node.js

// Import dependencies (use in browser with script tags or require in Node)
// <script src="../theory/scales.js"></script>
// <script src="../theory/chord-theory.js"></script>

function testContraryMotion() {
    console.log("TESTING CONTRARY MOTION VOICINGS");
    console.log("--------------------------------");
    
    // Reset ChordTheory to known state
    ChordTheory.currentScale = 'MAJOR_SIXTH_DIMINISHED_SCALE';
    ChordTheory.scaleRoot = 60; // C4
    ChordTheory.pivotPitch = 60; // C4 as pivot
    
    // Expected results from voicings.md
    const expectedVoicings = [
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
    
    // Test each voicing
    let allTestsPassed = true;
    
    expectedVoicings.forEach(test => {
        // Run the contraryMotion function with test input
        const result = ChordTheory.contraryMotion(test.input);
        
        // Check if result matches expected
        const passed = arraysEqual(result, test.expected);
        
        // Display result
        console.log(`${test.name} Voicing: ${passed ? "✓ PASS" : "✗ FAIL"}`);
        console.log(`  Input: ${test.input}`);
        console.log(`  Expected: [${test.expected.join(', ')}]`);
        console.log(`  Actual: [${result.join(', ')}]`);
        
        if (!passed) {
            allTestsPassed = false;
        }
    });
    
    console.log("\nOVERALL RESULT: " + (allTestsPassed ? "ALL TESTS PASSED ✓" : "SOME TESTS FAILED ✗"));
    
    return allTestsPassed;
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Run the test
testContraryMotion(); 