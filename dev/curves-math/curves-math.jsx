/**
 * curves-math.jsx
 * Phase 1 curve implementations for Rive + Android interpolators.
 * ExtendScript compatible (JavaScript 1.5).
 */

/**
 * Clamp a number into the [0, 1] range.
 * @param {Number} value Input value.
 * @returns {Number} Clamped value.
 */
function clamp01(value) {
    if (value < 0) {
        return 0;
    }
    if (value > 1) {
        return 1;
    }
    return value;
}

/**
 * Cubic Bezier interpolator used by Android Material curves.
 * @constructor
 * @param {Number} x1 Control point 1 x.
 * @param {Number} y1 Control point 1 y.
 * @param {Number} x2 Control point 2 x.
 * @param {Number} y2 Control point 2 y.
 */
function CubicBezierInterpolator(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

/**
 * Get interpolated Bezier y at normalized time t.
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Interpolated value in [0, 1].
 */
CubicBezierInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    if (clampedT === 0 || clampedT === 1) {
        return clampedT;
    }

    var low = 0;
    var high = 1;
    var u = 0.5;
    var i;

    for (i = 0; i < 20; i++) {
        u = (low + high) * 0.5;
        if (this.sampleX(u) < clampedT) {
            low = u;
        } else {
            high = u;
        }
    }

    return clamp01(this.sampleY(u));
};

/**
 * @param {Number} u Parameter in [0,1].
 * @returns {Number} X coordinate on curve.
 */
CubicBezierInterpolator.prototype.sampleX = function(u) {
    var inv = 1 - u;
    return (3 * inv * inv * u * this.x1) + (3 * inv * u * u * this.x2) + (u * u * u);
};

/**
 * @param {Number} u Parameter in [0,1].
 * @returns {Number} Y coordinate on curve.
 */
CubicBezierInterpolator.prototype.sampleY = function(u) {
    var inv = 1 - u;
    return (3 * inv * inv * u * this.y1) + (3 * inv * u * u * this.y2) + (u * u * u);
};

/**
 * Rive Elastic curve.
 * @constructor
 * @param {Number} amplitude Elastic amplitude.
 * @param {Number} period Elastic period.
 * @param {String} easingType One of: easeIn, easeOut, easeInOut.
 */
function RiveElasticCurve(amplitude, period, easingType) {
    this.amplitude = (typeof amplitude === 'number') ? amplitude : 1.0;
    this.period = (typeof period === 'number' && period > 0) ? period : 0.3;
    this.easingType = easingType || 'easeOut';
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
RiveElasticCurve.prototype.getValue = function(t) {
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
        return clamp01(x);
    }

    if (this.easingType === 'easeInOut') {
        var t2 = clampedT * 2;
        if (t2 < 1) {
            x = -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));
            return clamp01(x);
        }
        x = a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
        return clamp01(x);
    }

    x = a * Math.pow(2, -10 * clampedT) * Math.sin((clampedT - s) * (2 * Math.PI) / p) + 1;
    return clamp01(x);
};

/**
 * Android Linear interpolator.
 * @constructor
 */
function AndroidLinearInterpolator() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidLinearInterpolator.prototype.getValue = function(t) {
    return clamp01(t);
};

/**
 * Android Accelerate interpolator.
 * @constructor
 * @param {Number} factor Acceleration factor.
 */
function AndroidAccelerateInterpolator(factor) {
    this.factor = (typeof factor === 'number') ? factor : 1.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidAccelerateInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    if (this.factor === 1.0) {
        return clampedT * clampedT;
    }
    return Math.pow(clampedT, 2 * this.factor);
};

/**
 * Android Decelerate interpolator.
 * @constructor
 * @param {Number} factor Deceleration factor.
 */
function AndroidDecelerateInterpolator(factor) {
    this.factor = (typeof factor === 'number') ? factor : 1.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidDecelerateInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    if (this.factor === 1.0) {
        return 1.0 - (1.0 - clampedT) * (1.0 - clampedT);
    }
    return 1.0 - Math.pow((1.0 - clampedT), 2 * this.factor);
};

/**
 * Android AccelerateDecelerate interpolator.
 * @constructor
 */
function AndroidAccelerateDecelerateInterpolator() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidAccelerateDecelerateInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    return Math.cos((clampedT + 1.0) * Math.PI) / 2.0 + 0.5;
};

/**
 * Android Anticipate interpolator.
 * @constructor
 * @param {Number} tension Tension parameter.
 */
function AndroidAnticipateInterpolator(tension) {
    this.tension = (typeof tension === 'number') ? tension : 2.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidAnticipateInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    return clamp01(clampedT * clampedT * ((this.tension + 1.0) * clampedT - this.tension));
};

/**
 * Android Overshoot interpolator.
 * @constructor
 * @param {Number} tension Tension parameter.
 */
function AndroidOvershootInterpolator(tension) {
    this.tension = (typeof tension === 'number') ? tension : 2.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidOvershootInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t) - 1.0;
    return clamp01(clampedT * clampedT * ((this.tension + 1.0) * clampedT + this.tension) + 1.0);
};

/**
 * Android AnticipateOvershoot interpolator.
 * @constructor
 * @param {Number} tension Tension parameter.
 */
function AndroidAnticipateOvershootInterpolator(tension) {
    this.tension = (typeof tension === 'number') ? tension : 2.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value.
 */
AndroidAnticipateOvershootInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    var s = this.tension * 1.5;

    if (clampedT < 0.5) {
        return clamp01(0.5 * this.anticipatePart(clampedT * 2.0, s));
    }

    return clamp01(0.5 * (this.overshootPart(clampedT * 2.0 - 2.0, s) + 2.0));
};

/**
 * @param {Number} t Normalized time.
 * @param {Number} s Tension.
 * @returns {Number} Anticipate part value.
 */
AndroidAnticipateOvershootInterpolator.prototype.anticipatePart = function(t, s) {
    return t * t * ((s + 1.0) * t - s);
};

/**
 * @param {Number} t Normalized time.
 * @param {Number} s Tension.
 * @returns {Number} Overshoot part value.
 */
AndroidAnticipateOvershootInterpolator.prototype.overshootPart = function(t, s) {
    return t * t * ((s + 1.0) * t + s);
};

/**
 * Android Bounce interpolator.
 * @constructor
 */
function AndroidBounceInterpolator() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidBounceInterpolator.prototype.getValue = function(t) {
    var clampedT = clamp01(t) * 1.1226;

    if (clampedT < 0.3535) {
        return clamp01(this.bounce(clampedT));
    }

    if (clampedT < 0.7408) {
        return clamp01(this.bounce(clampedT - 0.54719) + 0.7);
    }

    if (clampedT < 0.9644) {
        return clamp01(this.bounce(clampedT - 0.8526) + 0.9);
    }

    return clamp01(this.bounce(clampedT - 1.0435) + 0.95);
};

/**
 * @param {Number} t Time.
 * @returns {Number} Bounce segment value.
 */
AndroidBounceInterpolator.prototype.bounce = function(t) {
    return t * t * 8.0;
};

/**
 * Android FastOutSlowIn (Material cubic Bezier 0.4, 0.0, 0.2, 1.0).
 * @constructor
 */
function AndroidFastOutSlowInInterpolator() {
    this.bezier = new CubicBezierInterpolator(0.4, 0.0, 0.2, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidFastOutSlowInInterpolator.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * Android FastOutLinearIn (Material cubic Bezier 0.4, 0.0, 1.0, 1.0).
 * @constructor
 */
function AndroidFastOutLinearInInterpolator() {
    this.bezier = new CubicBezierInterpolator(0.4, 0.0, 1.0, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidFastOutLinearInInterpolator.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * Android LinearOutSlowIn (Material cubic Bezier 0.0, 0.0, 0.2, 1.0).
 * @constructor
 */
function AndroidLinearOutSlowInInterpolator() {
    this.bezier = new CubicBezierInterpolator(0.0, 0.0, 0.2, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
AndroidLinearOutSlowInInterpolator.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * iOS Linear curve.
 * @constructor
 */
function IOSLinearCurve() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSLinearCurve.prototype.getValue = function(t) {
    return clamp01(t);
};

/**
 * iOS EaseIn curve (quadratic).
 * @constructor
 */
function IOSEaseInCurve() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSEaseInCurve.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    return clampedT * clampedT;
};

/**
 * iOS EaseOut curve (quadratic).
 * @constructor
 */
function IOSEaseOutCurve() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSEaseOutCurve.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    return 1.0 - (1.0 - clampedT) * (1.0 - clampedT);
};

/**
 * iOS EaseInOut curve (quadratic).
 * @constructor
 */
function IOSEaseInOutCurve() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSEaseInOutCurve.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    if (clampedT < 0.5) {
        return 2.0 * clampedT * clampedT;
    }
    return 1.0 - 2.0 * (1.0 - clampedT) * (1.0 - clampedT);
};

/**
 * iOS Default UIView curve alias (EaseInOut).
 * @constructor
 */
function IOSDefaultCurve() {
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSDefaultCurve.prototype.getValue = function(t) {
    var clampedT = clamp01(t);
    if (clampedT < 0.5) {
        return 2.0 * clampedT * clampedT;
    }
    return 1.0 - 2.0 * (1.0 - clampedT) * (1.0 - clampedT);
};

/**
 * Shared iOS spring curve using damped oscillation approximation.
 * @constructor
 * @param {Number} damping Damping ratio-like term.
 * @param {Number} velocity Initial velocity term.
 * @param {Number} duration Duration scaling term.
 */
function IOSSpringCurve(damping, velocity, duration) {
    this.damping = (typeof damping === 'number') ? damping : 0.8;
    this.velocity = (typeof velocity === 'number') ? velocity : 0.0;
    this.duration = (typeof duration === 'number' && duration > 0) ? duration : 1.0;
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSSpringCurve.prototype.getValue = function(t) {
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
    var omega = Math.PI / duration;
    var decay = Math.exp(-damping * 6.0 * clampedT);
    var phase = clampedT * omega;
    var velocityTerm = velocity * 0.2;
    var y = 1.0 - decay * (Math.cos(phase) + velocityTerm * Math.sin(phase));
    return clamp01(y);
};

/**
 * iOS Spring Default curve.
 * @constructor
 * @param {Number} damping Damping parameter.
 * @param {Number} velocity Initial velocity parameter.
 * @param {Number} duration Duration parameter.
 */
function IOSSpringDefaultCurve(damping, velocity, duration) {
    this.spring = new IOSSpringCurve(
        (typeof damping === 'number') ? damping : 0.8,
        (typeof velocity === 'number') ? velocity : 0.0,
        (typeof duration === 'number') ? duration : 1.0
    );
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSSpringDefaultCurve.prototype.getValue = function(t) {
    return this.spring.getValue(t);
};

/**
 * iOS Spring Gentle curve (higher damping).
 * @constructor
 * @param {Number} damping Damping parameter.
 * @param {Number} velocity Initial velocity parameter.
 * @param {Number} duration Duration parameter.
 */
function IOSSpringGentleCurve(damping, velocity, duration) {
    this.spring = new IOSSpringCurve(
        (typeof damping === 'number') ? damping : 0.9,
        (typeof velocity === 'number') ? velocity : 0.0,
        (typeof duration === 'number') ? duration : 1.0
    );
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSSpringGentleCurve.prototype.getValue = function(t) {
    return this.spring.getValue(t);
};

/**
 * iOS Spring Bouncy curve (lower damping).
 * @constructor
 * @param {Number} damping Damping parameter.
 * @param {Number} velocity Initial velocity parameter.
 * @param {Number} duration Duration parameter.
 */
function IOSSpringBouncyCurve(damping, velocity, duration) {
    this.spring = new IOSSpringCurve(
        (typeof damping === 'number') ? damping : 0.5,
        (typeof velocity === 'number') ? velocity : 0.0,
        (typeof duration === 'number') ? duration : 1.0
    );
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSSpringBouncyCurve.prototype.getValue = function(t) {
    return this.spring.getValue(t);
};

/**
 * iOS Spring Custom curve.
 * @constructor
 * @param {Number} damping Damping parameter.
 * @param {Number} velocity Initial velocity parameter.
 * @param {Number} duration Duration parameter.
 */
function IOSSpringCustomCurve(damping, velocity, duration) {
    this.spring = new IOSSpringCurve(
        (typeof damping === 'number') ? damping : 0.7,
        (typeof velocity === 'number') ? velocity : 0.0,
        (typeof duration === 'number') ? duration : 1.0
    );
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSSpringCustomCurve.prototype.getValue = function(t) {
    return this.spring.getValue(t);
};

/**
 * iOS CA Default timing function.
 * @constructor
 */
function IOSCADefaultCurve() {
    this.bezier = new CubicBezierInterpolator(0.25, 0.1, 0.25, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSCADefaultCurve.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * iOS CA EaseIn timing function.
 * @constructor
 */
function IOSCAEaseInCurve() {
    this.bezier = new CubicBezierInterpolator(0.42, 0.0, 1.0, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSCAEaseInCurve.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * iOS CA EaseOut timing function.
 * @constructor
 */
function IOSCAEaseOutCurve() {
    this.bezier = new CubicBezierInterpolator(0.0, 0.0, 0.58, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSCAEaseOutCurve.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * iOS CA EaseInEaseOut timing function.
 * @constructor
 */
function IOSCAEaseInEaseOutCurve() {
    this.bezier = new CubicBezierInterpolator(0.42, 0.0, 0.58, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSCAEaseInEaseOutCurve.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * iOS CA Linear timing function.
 * @constructor
 */
function IOSCALinearCurve() {
    this.bezier = new CubicBezierInterpolator(0.0, 0.0, 1.0, 1.0);
}

/**
 * @param {Number} t Normalized time in [0, 1].
 * @returns {Number} Curve value in [0, 1].
 */
IOSCALinearCurve.prototype.getValue = function(t) {
    return this.bezier.getValue(t);
};

/**
 * Format a number for test output.
 * @param {Number} value Number to format.
 * @returns {String} Rounded string.
 */
function formatValue(value) {
    return (Math.round(value * 1000000) / 1000000).toString();
}

/**
 * Print sample values for a curve.
 * @param {String} name Curve name.
 * @param {Object} curve Curve instance with getValue(t).
 */
function printCurveSamples(name, curve) {
    var sampleTs = [0, 0.25, 0.5, 0.75, 1.0];
    var i;
    $.writeln('--- ' + name + ' ---');
    for (i = 0; i < sampleTs.length; i++) {
        var t = sampleTs[i];
        var v = curve.getValue(t);
        $.writeln('t=' + t + ' -> ' + formatValue(v));
    }
}

/**
 * Run Phase 2 sample output.
 */
function runPhase2Tests() {
    printCurveSamples('Rive Elastic (amplitude=1.0, period=0.3, easingType=easeOut)', new RiveElasticCurve(1.0, 0.3, 'easeOut'));
    printCurveSamples('Android Linear', new AndroidLinearInterpolator());
    printCurveSamples('Android Accelerate (factor=1.0)', new AndroidAccelerateInterpolator(1.0));
    printCurveSamples('Android Decelerate (factor=1.0)', new AndroidDecelerateInterpolator(1.0));
    printCurveSamples('Android AccelerateDecelerate', new AndroidAccelerateDecelerateInterpolator());
    printCurveSamples('Android Anticipate (tension=2.0)', new AndroidAnticipateInterpolator(2.0));
    printCurveSamples('Android Overshoot (tension=2.0)', new AndroidOvershootInterpolator(2.0));
    printCurveSamples('Android AnticipateOvershoot (tension=2.0)', new AndroidAnticipateOvershootInterpolator(2.0));
    printCurveSamples('Android Bounce', new AndroidBounceInterpolator());
    printCurveSamples('Android FastOutSlowIn', new AndroidFastOutSlowInInterpolator());
    printCurveSamples('Android FastOutLinearIn', new AndroidFastOutLinearInInterpolator());
    printCurveSamples('Android LinearOutSlowIn', new AndroidLinearOutSlowInInterpolator());
    printCurveSamples('iOS Linear', new IOSLinearCurve());
    printCurveSamples('iOS EaseIn', new IOSEaseInCurve());
    printCurveSamples('iOS EaseOut', new IOSEaseOutCurve());
    printCurveSamples('iOS EaseInOut', new IOSEaseInOutCurve());
    printCurveSamples('iOS Default (UIView)', new IOSDefaultCurve());
    printCurveSamples('iOS Spring Default (damping=0.8, velocity=0.0, duration=1.0)', new IOSSpringDefaultCurve(0.8, 0.0, 1.0));
    printCurveSamples('iOS Spring Gentle (damping=0.9, velocity=0.0, duration=1.0)', new IOSSpringGentleCurve(0.9, 0.0, 1.0));
    printCurveSamples('iOS Spring Bouncy (damping=0.5, velocity=0.0, duration=1.0)', new IOSSpringBouncyCurve(0.5, 0.0, 1.0));
    printCurveSamples('iOS Spring Custom (damping=0.7, velocity=0.5, duration=1.0)', new IOSSpringCustomCurve(0.7, 0.5, 1.0));
    printCurveSamples('iOS CA Default', new IOSCADefaultCurve());
    printCurveSamples('iOS CA EaseIn', new IOSCAEaseInCurve());
    printCurveSamples('iOS CA EaseOut', new IOSCAEaseOutCurve());
    printCurveSamples('iOS CA EaseInEaseOut', new IOSCAEaseInEaseOutCurve());
    printCurveSamples('iOS CA Linear', new IOSCALinearCurve());
}

runPhase2Tests();
