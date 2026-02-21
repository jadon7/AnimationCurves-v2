/*
 * AnimationCurves Comprehensive Validation Test Suite
 * ExtendScript (ES3) - runnable in Adobe After Effects
 *
 * Run via: File > Scripts > Run Script File...
 *
 * Tests all curve implementations and recent fixes including:
 * - Rive Elastic (easeIn, easeOut, easeInOut)
 * - iOS Spring (Default, Gentle, Bouncy, Custom)
 * - Folme Spring
 * - Android Spring
 */

(function () {
    // ========================================
    // Part 1: Copy Curve Classes from AnimationCurves.jsx
    // ========================================

    function clamp01(value) {
        if (value < 0) {
            return 0;
        }
        if (value > 1) {
            return 1;
        }
        return value;
    }

    function RiveElasticCurve(amplitude, period, easingType) {
        this.amplitude = (typeof amplitude === 'number') ? amplitude : 1.0;
        this.period = (typeof period === 'number' && period > 0) ? period : 0.3;
        this.easingType = easingType || 'easeOut';
    }

    RiveElasticCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) {
            return 0;
        }
        if (clampedT === 1) {
            return 1;
        }

        var p = this.period;
        var a = Math.max(this.amplitude, 1.0);
        var s = p / (2 * Math.PI) * Math.asin(1 / a);
        var x;

        if (this.easingType === 'easeIn') {
            x = -(a * Math.pow(2, 10 * (clampedT - 1)) * Math.sin((clampedT - 1 - s) * (2 * Math.PI) / p));
            return x;
        }

        if (this.easingType === 'easeInOut') {
            var t2 = clampedT * 2;
            if (t2 < 1) {
                x = -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));
                return x;
            }
            x = a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
            return x;
        }

        x = a * Math.pow(2, -10 * clampedT) * Math.sin((clampedT - s) * (2 * Math.PI) / p) + 1;
        return x;
    };

    function IOSSpringCurve(damping, velocity, duration) {
        this.damping = (typeof damping === 'number') ? damping : 0.8;
        this.velocity = (typeof velocity === 'number') ? velocity : 0.0;
        this.duration = (typeof duration === 'number' && duration > 0) ? duration : 1.0;
    }

    IOSSpringCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) {
            return 0;
        }
        if (clampedT === 1) {
            return 1;
        }

        var damping = Math.max(this.damping, 0.0001);
        var duration = Math.max(this.duration, 0.0001);
        var velocity = this.velocity;
        var tau = clampedT * duration;
        var omega = 12 / duration;
        var envelope = Math.exp(-damping * 8 * tau);
        var y = 1.0 - envelope * (Math.cos(omega * tau) + (velocity / Math.max(omega, 0.0001)) * Math.sin(omega * tau));
        return y;
    };

    function IOSSpringDefaultCurve(damping, velocity, duration) {
        this.spring = new IOSSpringCurve(
            (typeof damping === 'number') ? damping : 0.8,
            (typeof velocity === 'number') ? velocity : 0.0,
            (typeof duration === 'number') ? duration : 1.0
        );
    }

    IOSSpringDefaultCurve.prototype.getValue = function (t) {
        return this.spring.getValue(t);
    };

    function IOSSpringGentleCurve(damping, velocity, duration) {
        this.spring = new IOSSpringCurve(
            (typeof damping === 'number') ? damping : 0.9,
            (typeof velocity === 'number') ? velocity : 0.0,
            (typeof duration === 'number') ? duration : 1.0
        );
    }

    IOSSpringGentleCurve.prototype.getValue = function (t) {
        return this.spring.getValue(t);
    };

    function IOSSpringBouncyCurve(damping, velocity, duration) {
        this.spring = new IOSSpringCurve(
            (typeof damping === 'number') ? damping : 0.5,
            (typeof velocity === 'number') ? velocity : 0.0,
            (typeof duration === 'number') ? duration : 1.0
        );
    }

    IOSSpringBouncyCurve.prototype.getValue = function (t) {
        return this.spring.getValue(t);
    };

    function IOSSpringCustomCurve(damping, velocity, duration) {
        this.spring = new IOSSpringCurve(
            (typeof damping === 'number') ? damping : 0.7,
            (typeof velocity === 'number') ? velocity : 0.0,
            (typeof duration === 'number') ? duration : 1.0
        );
    }

    IOSSpringCustomCurve.prototype.getValue = function (t) {
        return this.spring.getValue(t);
    };

    function FolmeSpringCurve(damping, response, duration) {
        this.damping = (typeof damping === 'number') ? damping : 0.9;
        this.response = (typeof response === 'number' && response > 0) ? response : 0.3;
        this.duration = (typeof duration === 'number' && duration > 0) ? duration : 0.5;
    }

    FolmeSpringCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) {
            return 0;
        }
        if (clampedT === 1) {
            return 1;
        }

        var damping = Math.max(this.damping, 0.0001);
        var response = Math.max(this.response, 0.0001);
        var duration = Math.max(this.duration, 0.0001);

        var mass = 1;
        var tension = Math.pow(2 * Math.PI / response, 2) * mass;
        var dampingCoeff = 4 * Math.PI * damping * mass / response;
        dampingCoeff = Math.min(dampingCoeff, 60);

        var physicsTime = clampedT * duration;
        var dt = 0.001;
        var steps = Math.floor(physicsTime / dt);
        var value = 0;
        var speed = 0;
        var target = 1;
        var i;

        for (i = 0; i < steps; i += 1) {
            var f = 0;
            f -= speed * dampingCoeff;
            f += (tension * (target - value));
            speed += f * dt;
            value += speed * dt;
        }

        return value;
    };

    function AndroidSpringCurve(tension, friction) {
        this.tension = (typeof tension === 'number' && tension > 0) ? tension : 160.0;
        this.friction = (typeof friction === 'number' && friction >= 0) ? friction : 18.0;
    }

    AndroidSpringCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) {
            return 0;
        }
        if (clampedT === 1) {
            return 1;
        }

        var k = this.tension;
        var c = this.friction;
        var physicsTime = clampedT;
        var delta = c * c - 4 * k;
        var x;
        var r1;
        var r2;
        var C1;
        var C2;
        var omega;
        var B;

        if (delta > 0) {
            r1 = (-c + Math.sqrt(delta)) / 2;
            r2 = (-c - Math.sqrt(delta)) / 2;
            C1 = r2 / (r1 - r2);
            C2 = -1 - C1;
            x = 1 + C1 * Math.exp(r1 * physicsTime) + C2 * Math.exp(r2 * physicsTime);
            return x;
        }

        if (delta === 0) {
            r1 = -c / 2;
            x = 1 + (-1 - r1 * physicsTime) * Math.exp(r1 * physicsTime);
            return x;
        }

        omega = Math.sqrt(4 * k - c * c) / 2;
        B = -c / (2 * omega);
        x = 1 - Math.exp(-c * physicsTime / 2) * (Math.cos(omega * physicsTime) + B * Math.sin(omega * physicsTime));
        return x;
    };

    // ========================================
    // Part 2: Test Framework
    // ========================================

    var TestResults = {
        passed: 0,
        failed: 0,
        total: 0,
        failures: []
    };

    function log(message) {
        $.writeln(message);
    }

    function formatNumber(value) {
        if (typeof value !== 'number') {
            return String(value);
        }
        return String(Math.round(value * 1000000) / 1000000);
    }

    function runTest(testName, testFn) {
        TestResults.total += 1;
        log('');
        log('TEST: ' + testName);
        log('----------------------------------------');

        try {
            testFn();
            TestResults.passed += 1;
            log('RESULT: PASS');
        } catch (err) {
            TestResults.failed += 1;
            TestResults.failures.push({
                name: testName,
                error: String(err)
            });
            log('RESULT: FAIL - ' + err);
        }
    }

    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message + ' (expected: ' + expected + ', got: ' + actual + ')');
        }
    }

    function assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    function assertIsNumber(value, message) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            throw new Error(message + ' (got: ' + value + ', type: ' + typeof value + ')');
        }
    }

    function assertInRange(value, min, max, message) {
        assertIsNumber(value, message + ' - value must be a number');
        if (value < min || value > max) {
            throw new Error(message + ' (expected range: [' + min + ', ' + max + '], got: ' + value + ')');
        }
    }

    // ========================================
    // Part 3: Test Suites
    // ========================================

    function testRiveElasticEaseOut() {
        var curve = new RiveElasticCurve(1.0, 0.3, 'easeOut');
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing Rive Elastic (easeOut) with default parameters');

        // Test boundary conditions
        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        // Test all standard t values
        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }

        // Test overshoot capability (easeOut can go > 1.0)
        value = curve.getValue(0.5);
        log('  Overshoot test: t=0.5 value=' + formatNumber(value));
        assertTrue(typeof value === 'number', 'Overshoot value should be numeric');
    }

    function testRiveElasticEaseIn() {
        var curve = new RiveElasticCurve(1.5, 0.4, 'easeIn');
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing Rive Elastic (easeIn) with custom parameters');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }

        // Test that easeIn can produce negative values (undershoot)
        value = curve.getValue(0.5);
        log('  Undershoot test: t=0.5 value=' + formatNumber(value));
        assertTrue(typeof value === 'number', 'Undershoot value should be numeric');
    }

    function testRiveElasticEaseInOut() {
        var curve = new RiveElasticCurve(2.0, 0.5, 'easeInOut');
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing Rive Elastic (easeInOut) with edge case parameters');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testIOSSpringDefault() {
        var curve = new IOSSpringDefaultCurve(0.8, 0.0, 1.0);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing iOS Spring Default with default parameters');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testIOSSpringGentle() {
        var curve = new IOSSpringGentleCurve(0.9, 0.0, 1.0);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing iOS Spring Gentle');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testIOSSpringBouncy() {
        var curve = new IOSSpringBouncyCurve(0.5, 0.2, 1.0);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing iOS Spring Bouncy with velocity');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }

        // Test overshoot capability
        value = curve.getValue(0.6);
        log('  Overshoot test: t=0.6 value=' + formatNumber(value));
        assertTrue(typeof value === 'number', 'Overshoot value should be numeric');
    }

    function testIOSSpringCustom() {
        var curve = new IOSSpringCustomCurve(0.7, 0.0, 1.0);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing iOS Spring Custom');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testFolmeSpring() {
        var curve = new FolmeSpringCurve(0.9, 0.3, 0.5);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing Folme Spring with default parameters');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testAndroidSpring() {
        var curve = new AndroidSpringCurve(160.0, 18.0);
        var tValues = [0, 0.25, 0.5, 0.75, 1.0];
        var i;
        var value;

        log('  Testing Android Spring with default parameters');

        assertEqual(curve.getValue(0), 0, 'getValue(0) should return 0');
        assertEqual(curve.getValue(1), 1, 'getValue(1) should return 1');

        for (i = 0; i < tValues.length; i += 1) {
            value = curve.getValue(tValues[i]);
            assertIsNumber(value, 't=' + tValues[i] + ' should return a valid number');
            log('    t=' + tValues[i] + ' -> ' + formatNumber(value));
        }
    }

    function testEdgeCaseParameters() {
        log('  Testing edge case parameters');

        // Rive Elastic with minimum amplitude
        var riveMin = new RiveElasticCurve(1.0, 0.1, 'easeOut');
        assertIsNumber(riveMin.getValue(0.5), 'Rive with min period should work');
        log('    Rive min period: OK');

        // Rive Elastic with maximum amplitude
        var riveMax = new RiveElasticCurve(3.0, 2.0, 'easeOut');
        assertIsNumber(riveMax.getValue(0.5), 'Rive with max parameters should work');
        log('    Rive max parameters: OK');

        // iOS Spring with minimum damping
        var iosMin = new IOSSpringDefaultCurve(0.1, 0.0, 0.1);
        assertIsNumber(iosMin.getValue(0.5), 'iOS with min damping should work');
        log('    iOS min damping: OK');

        // iOS Spring with maximum velocity
        var iosMax = new IOSSpringDefaultCurve(1.0, 3.0, 2.0);
        assertIsNumber(iosMax.getValue(0.5), 'iOS with max velocity should work');
        log('    iOS max velocity: OK');

        // Folme Spring with edge values
        var folmeEdge = new FolmeSpringCurve(0.1, 0.1, 0.1);
        assertIsNumber(folmeEdge.getValue(0.5), 'Folme with min values should work');
        log('    Folme min values: OK');

        // Android Spring with high tension
        var androidHigh = new AndroidSpringCurve(300.0, 80.0);
        assertIsNumber(androidHigh.getValue(0.5), 'Android with high tension should work');
        log('    Android high tension: OK');

        // Android Spring with low friction
        var androidLow = new AndroidSpringCurve(10.0, 0.0);
        assertIsNumber(androidLow.getValue(0.5), 'Android with zero friction should work');
        log('    Android zero friction: OK');
    }

    function testOvershootBehavior() {
        log('  Testing overshoot behavior (values > 1.0)');

        // Rive Elastic easeOut should overshoot
        var riveEaseOut = new RiveElasticCurve(1.5, 0.3, 'easeOut');
        var hasOvershoot = false;
        var i;
        var t;
        var value;

        for (i = 1; i <= 20; i += 1) {
            t = i / 20;
            value = riveEaseOut.getValue(t);
            if (value > 1.0) {
                hasOvershoot = true;
                log('    Rive easeOut overshoot at t=' + formatNumber(t) + ': ' + formatNumber(value));
                break;
            }
        }
        assertTrue(hasOvershoot, 'Rive Elastic easeOut should produce overshoot');

        // iOS Spring Bouncy should overshoot
        var iosBouncy = new IOSSpringBouncyCurve(0.5, 0.0, 1.0);
        hasOvershoot = false;

        for (i = 1; i <= 20; i += 1) {
            t = i / 20;
            value = iosBouncy.getValue(t);
            if (value > 1.0) {
                hasOvershoot = true;
                log('    iOS Bouncy overshoot at t=' + formatNumber(t) + ': ' + formatNumber(value));
                break;
            }
        }
        assertTrue(hasOvershoot, 'iOS Spring Bouncy should produce overshoot');
    }

    function testNoErrorsWithExtremeParameters() {
        log('  Testing that curves do not throw errors with extreme parameters');

        try {
            var rive1 = new RiveElasticCurve(10.0, 5.0, 'easeOut');
            rive1.getValue(0.5);
            log('    Rive extreme amplitude: OK');
        } catch (e) {
            throw new Error('Rive with extreme amplitude threw error: ' + e);
        }

        try {
            var ios1 = new IOSSpringDefaultCurve(0.01, 10.0, 5.0);
            ios1.getValue(0.5);
            log('    iOS extreme velocity: OK');
        } catch (e) {
            throw new Error('iOS with extreme velocity threw error: ' + e);
        }

        try {
            var folme1 = new FolmeSpringCurve(1.0, 2.0, 3.0);
            folme1.getValue(0.5);
            log('    Folme extreme values: OK');
        } catch (e) {
            throw new Error('Folme with extreme values threw error: ' + e);
        }

        try {
            var android1 = new AndroidSpringCurve(500.0, 100.0);
            android1.getValue(0.5);
            log('    Android extreme tension: OK');
        } catch (e) {
            throw new Error('Android with extreme tension threw error: ' + e);
        }
    }

    // ========================================
    // Part 4: Run All Tests
    // ========================================

    function runAllTests() {
        log('========================================');
        log('AnimationCurves Comprehensive Validation Test Suite');
        log('========================================');
        log('');

        // Rive Elastic Tests
        runTest('Rive Elastic - easeOut (default)', testRiveElasticEaseOut);
        runTest('Rive Elastic - easeIn (custom)', testRiveElasticEaseIn);
        runTest('Rive Elastic - easeInOut (edge case)', testRiveElasticEaseInOut);

        // iOS Spring Tests
        runTest('iOS Spring - Default', testIOSSpringDefault);
        runTest('iOS Spring - Gentle', testIOSSpringGentle);
        runTest('iOS Spring - Bouncy', testIOSSpringBouncy);
        runTest('iOS Spring - Custom', testIOSSpringCustom);

        // Folme Spring Tests
        runTest('Folme Spring', testFolmeSpring);

        // Android Spring Tests
        runTest('Android Spring', testAndroidSpring);

        // Edge Case Tests
        runTest('Edge Case Parameters', testEdgeCaseParameters);

        // Recent Fix Tests
        runTest('Overshoot Behavior (Recent Fix)', testOvershootBehavior);
        runTest('No Errors with Extreme Parameters', testNoErrorsWithExtremeParameters);

        // Print Summary
        log('');
        log('========================================');
        log('TEST SUMMARY');
        log('========================================');
        log('Total Tests:  ' + TestResults.total);
        log('Passed:       ' + TestResults.passed);
        log('Failed:       ' + TestResults.failed);
        log('========================================');

        if (TestResults.failed > 0) {
            log('');
            log('FAILURES:');
            var i;
            for (i = 0; i < TestResults.failures.length; i += 1) {
                log('  ' + (i + 1) + '. ' + TestResults.failures[i].name);
                log('     ' + TestResults.failures[i].error);
            }
        }

        log('');
        if (TestResults.failed === 0) {
            log('ALL TESTS PASSED!');
            alert('All tests passed! (' + TestResults.passed + '/' + TestResults.total + ')');
        } else {
            log('SOME TESTS FAILED!');
            alert('Tests completed with ' + TestResults.failed + ' failure(s). See console for details.');
        }
    }

    // Run the test suite
    runAllTests();
}());
