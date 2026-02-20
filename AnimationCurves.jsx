(function () {
    // Part 1: Curve Mathematics
    function clamp01(value) {
        if (value < 0) {
            return 0;
        }
        if (value > 1) {
            return 1;
        }
        return value;
    }

    function CubicBezierInterpolator(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    CubicBezierInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0 || clampedT === 1) {
            return clampedT;
        }

        var low = 0;
        var high = 1;
        var u = 0.5;
        var i;

        for (i = 0; i < 20; i += 1) {
            u = (low + high) * 0.5;
            if (this.sampleX(u) < clampedT) {
                low = u;
            } else {
                high = u;
            }
        }

        return clamp01(this.sampleY(u));
    };

    CubicBezierInterpolator.prototype.sampleX = function (u) {
        var inv = 1 - u;
        return (3 * inv * inv * u * this.x1) + (3 * inv * u * u * this.x2) + (u * u * u);
    };

    CubicBezierInterpolator.prototype.sampleY = function (u) {
        var inv = 1 - u;
        return (3 * inv * inv * u * this.y1) + (3 * inv * u * u * this.y2) + (u * u * u);
    };

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

    function AndroidLinearInterpolator() {
    }

    AndroidLinearInterpolator.prototype.getValue = function (t) {
        return clamp01(t);
    };

    function AndroidAccelerateInterpolator(factor) {
        this.factor = (typeof factor === 'number') ? factor : 1.0;
    }

    AndroidAccelerateInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (this.factor === 1.0) {
            return clampedT * clampedT;
        }
        return Math.pow(clampedT, 2 * this.factor);
    };

    function AndroidDecelerateInterpolator(factor) {
        this.factor = (typeof factor === 'number') ? factor : 1.0;
    }

    AndroidDecelerateInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (this.factor === 1.0) {
            return 1.0 - (1.0 - clampedT) * (1.0 - clampedT);
        }
        return 1.0 - Math.pow((1.0 - clampedT), 2 * this.factor);
    };

    function AndroidAccelerateDecelerateInterpolator() {
    }

    AndroidAccelerateDecelerateInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        return Math.cos((clampedT + 1.0) * Math.PI) / 2.0 + 0.5;
    };

    function AndroidAnticipateInterpolator(tension) {
        this.tension = (typeof tension === 'number') ? tension : 2.0;
    }

    AndroidAnticipateInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        return clamp01(clampedT * clampedT * ((this.tension + 1.0) * clampedT - this.tension));
    };

    function AndroidOvershootInterpolator(tension) {
        this.tension = (typeof tension === 'number') ? tension : 2.0;
    }

    AndroidOvershootInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t) - 1.0;
        return clamp01(clampedT * clampedT * ((this.tension + 1.0) * clampedT + this.tension) + 1.0);
    };

    function AndroidAnticipateOvershootInterpolator(tension) {
        this.tension = (typeof tension === 'number') ? tension : 2.0;
    }

    AndroidAnticipateOvershootInterpolator.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        var s = this.tension * 1.5;

        if (clampedT < 0.5) {
            return clamp01(0.5 * this.anticipatePart(clampedT * 2.0, s));
        }

        return clamp01(0.5 * (this.overshootPart(clampedT * 2.0 - 2.0, s) + 2.0));
    };

    AndroidAnticipateOvershootInterpolator.prototype.anticipatePart = function (t, s) {
        return t * t * ((s + 1.0) * t - s);
    };

    AndroidAnticipateOvershootInterpolator.prototype.overshootPart = function (t, s) {
        return t * t * ((s + 1.0) * t + s);
    };

    function AndroidBounceInterpolator() {
    }

    AndroidBounceInterpolator.prototype.getValue = function (t) {
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

    AndroidBounceInterpolator.prototype.bounce = function (t) {
        return t * t * 8.0;
    };

    function AndroidFastOutSlowInInterpolator() {
        this.bezier = new CubicBezierInterpolator(0.4, 0.0, 0.2, 1.0);
    }

    AndroidFastOutSlowInInterpolator.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function AndroidFastOutLinearInInterpolator() {
        this.bezier = new CubicBezierInterpolator(0.4, 0.0, 1.0, 1.0);
    }

    AndroidFastOutLinearInInterpolator.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function AndroidLinearOutSlowInInterpolator() {
        this.bezier = new CubicBezierInterpolator(0.0, 0.0, 0.2, 1.0);
    }

    AndroidLinearOutSlowInInterpolator.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function IOSLinearCurve() {
    }

    IOSLinearCurve.prototype.getValue = function (t) {
        return clamp01(t);
    };

    function IOSEaseInCurve() {
    }

    IOSEaseInCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        return clampedT * clampedT;
    };

    function IOSEaseOutCurve() {
    }

    IOSEaseOutCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        return 1.0 - (1.0 - clampedT) * (1.0 - clampedT);
    };

    function IOSEaseInOutCurve() {
    }

    IOSEaseInOutCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT < 0.5) {
            return 2.0 * clampedT * clampedT;
        }
        return 1.0 - 2.0 * (1.0 - clampedT) * (1.0 - clampedT);
    };

    function IOSDefaultCurve() {
    }

    IOSDefaultCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT < 0.5) {
            return 2.0 * clampedT * clampedT;
        }
        return 1.0 - 2.0 * (1.0 - clampedT) * (1.0 - clampedT);
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
        var omega = Math.PI / duration;
        var decay = Math.exp(-damping * 6.0 * clampedT);
        var phase = clampedT * omega;
        var velocityTerm = velocity * 0.2;
        var y = 1.0 - decay * (Math.cos(phase) + velocityTerm * Math.sin(phase));
        return clamp01(y);
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

    function IOSCADefaultCurve() {
        this.bezier = new CubicBezierInterpolator(0.25, 0.1, 0.25, 1.0);
    }

    IOSCADefaultCurve.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function IOSCAEaseInCurve() {
        this.bezier = new CubicBezierInterpolator(0.42, 0.0, 1.0, 1.0);
    }

    IOSCAEaseInCurve.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function IOSCAEaseOutCurve() {
        this.bezier = new CubicBezierInterpolator(0.0, 0.0, 0.58, 1.0);
    }

    IOSCAEaseOutCurve.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function IOSCAEaseInEaseOutCurve() {
        this.bezier = new CubicBezierInterpolator(0.42, 0.0, 0.58, 1.0);
    }

    IOSCAEaseInEaseOutCurve.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    function IOSCALinearCurve() {
        this.bezier = new CubicBezierInterpolator(0.0, 0.0, 1.0, 1.0);
    }

    IOSCALinearCurve.prototype.getValue = function (t) {
        return this.bezier.getValue(t);
    };

    // Part 2: Expression Generator
    function ExpressionGenerator() {
        this.templates = {
            rive: {
                elastic: this._buildRiveElastic
            },
            android: {
                linear: this._buildAndroidLinear,
                accelerate: this._buildAndroidAccelerate,
                decelerate: this._buildAndroidDecelerate,
                acceleratedecelerate: this._buildAndroidAccelerateDecelerate,
                anticipate: this._buildAndroidAnticipate,
                overshoot: this._buildAndroidOvershoot,
                anticipateovershoot: this._buildAndroidAnticipateOvershoot,
                bounce: this._buildAndroidBounce,
                fastoutslowin: this._buildAndroidFastOutSlowIn,
                fastoutlinearin: this._buildAndroidFastOutLinearIn,
                linearoutslowin: this._buildAndroidLinearOutSlowIn
            },
            ios: {
                linear: this._buildIOSLinear,
                "default": this._buildIOSDefault,
                easein: this._buildIOSEaseIn,
                easeout: this._buildIOSEaseOut,
                easeinout: this._buildIOSEaseInOut,
                "spring default": this._buildIOSSpringDefault,
                "spring gentle": this._buildIOSSpringGentle,
                "spring bouncy": this._buildIOSSpringBouncy,
                "spring custom": this._buildIOSSpringCustom,
                "ca default": this._buildIOSCADefault,
                "ca easein": this._buildIOSCAEaseIn,
                "ca easeout": this._buildIOSCAEaseOut,
                "ca easeineaseout": this._buildIOSCAEaseInEaseOut,
                "ca linear": this._buildIOSCALinear
            }
        };
    }

    ExpressionGenerator.prototype.generate = function (platform, curveType, params) {
        var p = normalizePlatform(platform);
        var c = normalizeCurveType(curveType);
        var normalizedParams = params || {};
        var builder;

        if (!this.templates[p]) {
            throw new Error('Unsupported platform: ' + platform);
        }

        builder = this.templates[p][c];
        if (!builder) {
            throw new Error('Unsupported curve: ' + platform + ' / ' + curveType);
        }

        return builder.call(this, normalizedParams);
    };

    ExpressionGenerator.prototype._composeExpression = function (title, paramsLine, curveCode) {
        return "// " + title + "\n" +
            "// Parameters: " + paramsLine + "\n" +
            "var duration = outPoint - inPoint;\n" +
            "var t = (duration <= 0) ? 1 : (time - inPoint) / duration;\n" +
            "if (t <= 0) t = 0;\n" +
            "if (t >= 1) t = 1;\n" +
            "\n" +
            "var val;\n" +
            curveCode +
            "\n" +
            "var startVal = valueAtTime(inPoint);\n" +
            "var endVal = valueAtTime(outPoint);\n" +
            "linear(val, 0, 1, startVal, endVal);\n";
    };

    ExpressionGenerator.prototype._buildCubicBezierCode = function (x1, y1, x2, y2) {
        return "var x1 = " + x1 + ";\n" +
            "var y1 = " + y1 + ";\n" +
            "var x2 = " + x2 + ";\n" +
            "var y2 = " + y2 + ";\n" +
            "function sampleCurveX(u) {\n" +
            "    var inv = 1 - u;\n" +
            "    return (3 * inv * inv * u * x1) + (3 * inv * u * u * x2) + (u * u * u);\n" +
            "}\n" +
            "function sampleCurveY(u) {\n" +
            "    var inv = 1 - u;\n" +
            "    return (3 * inv * inv * u * y1) + (3 * inv * u * u * y2) + (u * u * u);\n" +
            "}\n" +
            "if (t === 0 || t === 1) {\n" +
            "    val = t;\n" +
            "} else {\n" +
            "    var low = 0;\n" +
            "    var high = 1;\n" +
            "    var u = 0.5;\n" +
            "    var i;\n" +
            "    for (i = 0; i < 20; i++) {\n" +
            "        u = (low + high) * 0.5;\n" +
            "        if (sampleCurveX(u) < t) {\n" +
            "            low = u;\n" +
            "        } else {\n" +
            "            high = u;\n" +
            "        }\n" +
            "    }\n" +
            "    val = sampleCurveY(u);\n" +
            "}\n";
    };

    ExpressionGenerator.prototype._buildRiveElastic = function (params) {
        var amplitude = (params.amplitude !== undefined) ? params.amplitude : 1.0;
        var period = (params.period !== undefined) ? params.period : 0.3;
        var easingType = normalizeEasingType(params.easingType || 'easeOut');
        var curveCode = "var p = " + period + ";\n" +
            "var a = Math.max(" + amplitude + ", 1.0);\n" +
            "var s = p / (2 * Math.PI) * Math.asin(1 / a);\n" +
            "if (t === 0) {\n" +
            "    val = 0;\n" +
            "} else if (t === 1) {\n" +
            "    val = 1;\n" +
            "} else if (\"" + easingType + "\" === \"easeOut\") {\n" +
            "    val = a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;\n" +
            "} else if (\"" + easingType + "\" === \"easeIn\") {\n" +
            "    val = -(a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));\n" +
            "} else {\n" +
            "    var t2 = t * 2;\n" +
            "    if (t2 < 1) {\n" +
            "        val = -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));\n" +
            "    } else {\n" +
            "        val = a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;\n" +
            "    }\n" +
            "}\n";

        return this._composeExpression(
            'Rive - Elastic',
            'amplitude=' + amplitude + ', period=' + period + ', easingType=' + easingType,
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildAndroidLinear = function () {
        return this._composeExpression('Android - Linear', 'none', 'val = t;\n');
    };

    ExpressionGenerator.prototype._buildAndroidAccelerate = function (params) {
        var factor = (params.factor !== undefined) ? params.factor : 1.0;
        var curveCode = "var factor = " + factor + ";\n" +
            "if (factor === 1.0) {\n" +
            "    val = t * t;\n" +
            "} else {\n" +
            "    val = Math.pow(t, 2 * factor);\n" +
            "}\n";

        return this._composeExpression('Android - Accelerate', 'factor=' + factor, curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidDecelerate = function (params) {
        var factor = (params.factor !== undefined) ? params.factor : 1.0;
        var curveCode = "var factor = " + factor + ";\n" +
            "if (factor === 1.0) {\n" +
            "    var oneMinusT = 1 - t;\n" +
            "    val = 1 - oneMinusT * oneMinusT;\n" +
            "} else {\n" +
            "    val = 1 - Math.pow((1 - t), 2 * factor);\n" +
            "}\n";

        return this._composeExpression('Android - Decelerate', 'factor=' + factor, curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidAccelerateDecelerate = function () {
        return this._composeExpression(
            'Android - AccelerateDecelerate',
            'none',
            'val = Math.cos((t + 1) * Math.PI) / 2 + 0.5;\n'
        );
    };

    ExpressionGenerator.prototype._buildAndroidAnticipate = function (params) {
        var tension = (params.tension !== undefined) ? params.tension : 2.0;
        var curveCode = "var tension = " + tension + ";\n" +
            "val = t * t * ((tension + 1) * t - tension);\n";

        return this._composeExpression('Android - Anticipate', 'tension=' + tension, curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidOvershoot = function (params) {
        var tension = (params.tension !== undefined) ? params.tension : 2.0;
        var curveCode = "var tension = " + tension + ";\n" +
            "var x = t - 1;\n" +
            "val = x * x * ((tension + 1) * x + tension) + 1;\n";

        return this._composeExpression('Android - Overshoot', 'tension=' + tension, curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidAnticipateOvershoot = function (params) {
        var tension = (params.tension !== undefined) ? params.tension : 2.0;
        var curveCode = "var tension = " + tension + ";\n" +
            "var s = tension * 1.5;\n" +
            "if (t < 0.5) {\n" +
            "    var x1 = t * 2;\n" +
            "    val = 0.5 * (x1 * x1 * ((s + 1) * x1 - s));\n" +
            "} else {\n" +
            "    var x2 = t * 2 - 2;\n" +
            "    val = 0.5 * (x2 * x2 * ((s + 1) * x2 + s) + 2);\n" +
            "}\n";

        return this._composeExpression('Android - AnticipateOvershoot', 'tension=' + tension, curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidBounce = function () {
        var curveCode = "function bounce(x) {\n" +
            "    return x * x * 8;\n" +
            "}\n" +
            "var x = t * 1.1226;\n" +
            "if (x < 0.3535) {\n" +
            "    val = bounce(x);\n" +
            "} else if (x < 0.7408) {\n" +
            "    val = bounce(x - 0.54719) + 0.7;\n" +
            "} else if (x < 0.9644) {\n" +
            "    val = bounce(x - 0.8526) + 0.9;\n" +
            "} else {\n" +
            "    val = bounce(x - 1.0435) + 0.95;\n" +
            "}\n";

        return this._composeExpression('Android - Bounce', 'none', curveCode);
    };

    ExpressionGenerator.prototype._buildAndroidFastOutSlowIn = function () {
        return this._composeExpression('Android - FastOutSlowIn', 'none', this._buildCubicBezierCode(0.4, 0.0, 0.2, 1.0));
    };

    ExpressionGenerator.prototype._buildAndroidFastOutLinearIn = function () {
        return this._composeExpression('Android - FastOutLinearIn', 'none', this._buildCubicBezierCode(0.4, 0.0, 1.0, 1.0));
    };

    ExpressionGenerator.prototype._buildAndroidLinearOutSlowIn = function () {
        return this._composeExpression('Android - LinearOutSlowIn', 'none', this._buildCubicBezierCode(0.0, 0.0, 0.2, 1.0));
    };

    ExpressionGenerator.prototype._buildIOSLinear = function () {
        return this._composeExpression('iOS - Linear', 'none', 'val = t;\n');
    };

    ExpressionGenerator.prototype._buildIOSDefault = function () {
        var curveCode = "if (t < 0.5) {\n" +
            "    val = 2 * t * t;\n" +
            "} else {\n" +
            "    val = 1 - Math.pow(-2 * t + 2, 2) / 2;\n" +
            "}\n";

        return this._composeExpression('iOS - Default', 'none', curveCode);
    };

    ExpressionGenerator.prototype._buildIOSEaseIn = function () {
        return this._composeExpression('iOS - EaseIn', 'none', 'val = t * t;\n');
    };

    ExpressionGenerator.prototype._buildIOSEaseOut = function () {
        var curveCode = "var oneMinusT = 1 - t;\n" +
            "val = 1 - oneMinusT * oneMinusT;\n";

        return this._composeExpression('iOS - EaseOut', 'none', curveCode);
    };

    ExpressionGenerator.prototype._buildIOSEaseInOut = function () {
        var curveCode = "if (t < 0.5) {\n" +
            "    val = 2 * t * t;\n" +
            "} else {\n" +
            "    val = 1 - Math.pow(-2 * t + 2, 2) / 2;\n" +
            "}\n";

        return this._composeExpression('iOS - EaseInOut', 'none', curveCode);
    };

    ExpressionGenerator.prototype._buildIOSSpringCode = function (damping, velocity, duration) {
        return "var damping = " + damping + ";\n" +
            "var velocity = " + velocity + ";\n" +
            "var springDuration = " + duration + ";\n" +
            "if (t === 0) {\n" +
            "    val = 0;\n" +
            "} else if (t === 1) {\n" +
            "    val = 1;\n" +
            "} else {\n" +
            "    var tau = t * springDuration;\n" +
            "    var omega = 12 / Math.max(springDuration, 0.0001);\n" +
            "    var envelope = Math.exp(-damping * 8 * tau);\n" +
            "    val = 1 - envelope * (Math.cos(omega * tau) + (velocity / Math.max(omega, 0.0001)) * Math.sin(omega * tau));\n" +
            "}\n";
    };

    ExpressionGenerator.prototype._buildIOSSpringDefault = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.8;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var duration = (params.duration !== undefined) ? params.duration : 1.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

        return this._composeExpression(
            'iOS - Spring Default',
            'damping=' + damping + ', velocity=' + velocity + ', duration=' + duration,
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringGentle = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.9;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var duration = (params.duration !== undefined) ? params.duration : 1.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

        return this._composeExpression(
            'iOS - Spring Gentle',
            'damping=' + damping + ', velocity=' + velocity + ', duration=' + duration,
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringBouncy = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.5;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var duration = (params.duration !== undefined) ? params.duration : 1.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

        return this._composeExpression(
            'iOS - Spring Bouncy',
            'damping=' + damping + ', velocity=' + velocity + ', duration=' + duration,
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringCustom = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.7;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var duration = (params.duration !== undefined) ? params.duration : 1.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

        return this._composeExpression(
            'iOS - Spring Custom',
            'damping=' + damping + ', velocity=' + velocity + ', duration=' + duration,
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildIOSCADefault = function () {
        return this._composeExpression('iOS - CA Default', 'none', this._buildCubicBezierCode(0.25, 0.1, 0.25, 1.0));
    };

    ExpressionGenerator.prototype._buildIOSCAEaseIn = function () {
        return this._composeExpression('iOS - CA EaseIn', 'none', this._buildCubicBezierCode(0.42, 0.0, 1.0, 1.0));
    };

    ExpressionGenerator.prototype._buildIOSCAEaseOut = function () {
        return this._composeExpression('iOS - CA EaseOut', 'none', this._buildCubicBezierCode(0.0, 0.0, 0.58, 1.0));
    };

    ExpressionGenerator.prototype._buildIOSCAEaseInEaseOut = function () {
        return this._composeExpression('iOS - CA EaseInEaseOut', 'none', this._buildCubicBezierCode(0.42, 0.0, 0.58, 1.0));
    };

    ExpressionGenerator.prototype._buildIOSCALinear = function () {
        return this._composeExpression('iOS - CA Linear', 'none', this._buildCubicBezierCode(0.0, 0.0, 1.0, 1.0));
    };

    // Part 3: Data Model
    function Model() {
        this.platform = 'rive';
        this.curveType = 'elastic';
        this.params = {
            amplitude: 1.0,
            period: 0.3,
            easingType: 'easeOut'
        };
    }

    Model.prototype.setPlatform = function (platform) {
        this.platform = normalizePlatform(platform);
    };

    Model.prototype.setCurveType = function (type) {
        this.curveType = normalizeCurveType(type);
    };

    Model.prototype.setParam = function (name, value) {
        this.params[name] = value;
    };

    Model.prototype.getParams = function () {
        var copy = {};
        var key;
        for (key in this.params) {
            if (this.params.hasOwnProperty(key)) {
                copy[key] = this.params[key];
            }
        }
        return copy;
    };

    Model.prototype.resetParams = function (params) {
        this.params = {};
        var key;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                this.params[key] = params[key];
            }
        }
    };

    // Part 4: View Model
    function ViewModel(model) {
        this.model = model;
        this.curveFactory = new CurveFactory();
        this.expressionGenerator = new ExpressionGenerator();
        this.onStateChanged = null;
    }

    ViewModel.prototype.setPlatform = function (platform) {
        this.model.setPlatform(platform);
        this._notify();
    };

    ViewModel.prototype.setCurveType = function (type) {
        this.model.setCurveType(type);
        this._notify();
    };

    ViewModel.prototype.setParam = function (name, value) {
        this.model.setParam(name, value);
        this._notify();
    };

    ViewModel.prototype.setParams = function (params) {
        this.model.resetParams(params || {});
        this._notify();
    };

    ViewModel.prototype.getPlatform = function () {
        return this.model.platform;
    };

    ViewModel.prototype.getCurveType = function () {
        return this.model.curveType;
    };

    ViewModel.prototype.getParams = function () {
        return this.model.getParams();
    };

    ViewModel.prototype.generateExpression = function () {
        var platform = this.model.platform;
        var curveType = this.model.curveType;
        var params = this.model.getParams();

        this.curveFactory.createCurve(platform, curveType, params);
        return this.expressionGenerator.generate(platform, curveType, params);
    };

    ViewModel.prototype._notify = function () {
        if (typeof this.onStateChanged === 'function') {
            this.onStateChanged();
        }
    };

    // Part 5: Curve Factory
    function CurveFactory() {
    }

    CurveFactory.prototype.createCurve = function (platform, type, params) {
        var p = normalizePlatform(platform);
        var t = normalizeCurveType(type);
        var cfg = params || {};

        if (p === 'rive') {
            if (t === 'elastic') {
                return new RiveElasticCurve(
                    ensureNumber(cfg.amplitude, 'amplitude', 1.0),
                    ensurePositiveNumber(cfg.period, 'period', 0.3),
                    normalizeEasingType(cfg.easingType || 'easeOut')
                );
            }
            throw new Error('Unsupported Rive curve: ' + type);
        }

        if (p === 'android') {
            if (t === 'linear') {
                return new AndroidLinearInterpolator();
            }
            if (t === 'accelerate') {
                return new AndroidAccelerateInterpolator(ensureNumber(cfg.factor, 'factor', 1.0));
            }
            if (t === 'decelerate') {
                return new AndroidDecelerateInterpolator(ensureNumber(cfg.factor, 'factor', 1.0));
            }
            if (t === 'acceleratedecelerate') {
                return new AndroidAccelerateDecelerateInterpolator();
            }
            if (t === 'anticipate') {
                return new AndroidAnticipateInterpolator(ensureNumber(cfg.tension, 'tension', 2.0));
            }
            if (t === 'overshoot') {
                return new AndroidOvershootInterpolator(ensureNumber(cfg.tension, 'tension', 2.0));
            }
            if (t === 'anticipateovershoot') {
                return new AndroidAnticipateOvershootInterpolator(ensureNumber(cfg.tension, 'tension', 2.0));
            }
            if (t === 'bounce') {
                return new AndroidBounceInterpolator();
            }
            if (t === 'fastoutslowin') {
                return new AndroidFastOutSlowInInterpolator();
            }
            if (t === 'fastoutlinearin') {
                return new AndroidFastOutLinearInInterpolator();
            }
            if (t === 'linearoutslowin') {
                return new AndroidLinearOutSlowInInterpolator();
            }
            throw new Error('Unsupported Android curve: ' + type);
        }

        if (p === 'ios') {
            if (t === 'linear') {
                return new IOSLinearCurve();
            }
            if (t === 'default') {
                return new IOSDefaultCurve();
            }
            if (t === 'easein') {
                return new IOSEaseInCurve();
            }
            if (t === 'easeout') {
                return new IOSEaseOutCurve();
            }
            if (t === 'easeinout') {
                return new IOSEaseInOutCurve();
            }
            if (t === 'spring default') {
                return new IOSSpringDefaultCurve(
                    ensureNumber(cfg.damping, 'damping', 0.8),
                    ensureNumber(cfg.velocity, 'velocity', 0.0),
                    ensurePositiveNumber(cfg.duration, 'duration', 1.0)
                );
            }
            if (t === 'spring gentle') {
                return new IOSSpringGentleCurve(
                    ensureNumber(cfg.damping, 'damping', 0.9),
                    ensureNumber(cfg.velocity, 'velocity', 0.0),
                    ensurePositiveNumber(cfg.duration, 'duration', 1.0)
                );
            }
            if (t === 'spring bouncy') {
                return new IOSSpringBouncyCurve(
                    ensureNumber(cfg.damping, 'damping', 0.5),
                    ensureNumber(cfg.velocity, 'velocity', 0.0),
                    ensurePositiveNumber(cfg.duration, 'duration', 1.0)
                );
            }
            if (t === 'spring custom') {
                return new IOSSpringCustomCurve(
                    ensureNumber(cfg.damping, 'damping', 0.7),
                    ensureNumber(cfg.velocity, 'velocity', 0.0),
                    ensurePositiveNumber(cfg.duration, 'duration', 1.0)
                );
            }
            if (t === 'ca default') {
                return new IOSCADefaultCurve();
            }
            if (t === 'ca easein') {
                return new IOSCAEaseInCurve();
            }
            if (t === 'ca easeout') {
                return new IOSCAEaseOutCurve();
            }
            if (t === 'ca easeineaseout') {
                return new IOSCAEaseInEaseOutCurve();
            }
            if (t === 'ca linear') {
                return new IOSCALinearCurve();
            }
            throw new Error('Unsupported iOS curve: ' + type);
        }

        throw new Error('Unsupported platform: ' + platform);
    };

    // Part 6: UI Components
    var PLATFORM_DATA = {
        Rive: {
            curves: [
                {
                    name: 'Elastic',
                    params: [
                        { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 1.0, max: 3.0, step: 0.01, defaultValue: 1.0 },
                        { key: 'period', label: 'Period', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.3 },
                        { key: 'easingType', label: 'Easing Type', type: 'dropdown', options: ['Ease Out', 'Ease In', 'Ease In-Out'], defaultValue: 'Ease Out' }
                    ]
                }
            ]
        },
        Android: {
            curves: [
                { name: 'Linear', params: [] },
                { name: 'Accelerate', params: [{ key: 'factor', label: 'Factor', type: 'slider', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0 }] },
                { name: 'Decelerate', params: [{ key: 'factor', label: 'Factor', type: 'slider', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0 }] },
                { name: 'AccelerateDecelerate', params: [] },
                { name: 'Anticipate', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                { name: 'Overshoot', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                { name: 'AnticipateOvershoot', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                { name: 'Bounce', params: [] },
                { name: 'FastOutSlowIn', params: [] },
                { name: 'FastOutLinearIn', params: [] },
                { name: 'LinearOutSlowIn', params: [] }
            ]
        },
        iOS: {
            curves: [
                { name: 'Linear', params: [] },
                { name: 'Default', params: [] },
                { name: 'EaseIn', params: [] },
                { name: 'EaseOut', params: [] },
                { name: 'EaseInOut', params: [] },
                {
                    name: 'Spring Default',
                    params: [
                        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.7 },
                        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                        { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.5 }
                    ]
                },
                {
                    name: 'Spring Gentle',
                    params: [
                        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.9 },
                        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                        { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.6 }
                    ]
                },
                {
                    name: 'Spring Bouncy',
                    params: [
                        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.5 },
                        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.2 },
                        { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.7 }
                    ]
                },
                {
                    name: 'Spring Custom',
                    params: [
                        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.8 },
                        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                        { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.5 }
                    ]
                },
                { name: 'CA Default', params: [] },
                { name: 'CA EaseIn', params: [] },
                { name: 'CA EaseOut', params: [] },
                { name: 'CA EaseInEaseOut', params: [] },
                { name: 'CA Linear', params: [] }
            ]
        }
    };

    function createUI(viewModel) {
        var win = new Window('palette', 'Animation Curves v2.0', undefined, { resizeable: false });
        win.orientation = 'column';
        win.alignChildren = ['fill', 'top'];
        win.spacing = 8;
        win.margins = 10;
        win.preferredSize = [330, 690];

        var tabs = win.add('tabbedpanel');
        tabs.alignChildren = ['fill', 'top'];
        tabs.preferredSize = [310, 490];

        var riveTab = tabs.add('tab', undefined, 'Rive');
        var androidTab = tabs.add('tab', undefined, 'Android');
        var iosTab = tabs.add('tab', undefined, 'iOS');

        var uiByPlatform = {};
        var currentPlatform = 'Rive';

        function refreshLayout() {
            win.layout.layout(true);
            win.layout.resize();
        }

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function roundToStep(value, step) {
            if (!step || step <= 0) {
                return value;
            }
            return Math.round(value / step) * step;
        }

        function getDecimals(step) {
            var str;
            var parts;
            if (!step || step >= 1) {
                return 0;
            }
            str = String(step);
            parts = str.split('.');
            return parts.length > 1 ? parts[1].length : 0;
        }

        function formatNumber(value, decimals) {
            var p = Math.pow(10, decimals || 0);
            return String(Math.round(value * p) / p);
        }

        function defaultParamsForCurve(curveDef) {
            var params = {};
            var i;
            var p;
            if (!curveDef || !curveDef.params) {
                return params;
            }
            for (i = 0; i < curveDef.params.length; i += 1) {
                p = curveDef.params[i];
                if (p.key === 'easingType') {
                    params[p.key] = normalizeEasingType(p.defaultValue);
                } else {
                    params[p.key] = p.defaultValue;
                }
            }
            return params;
        }

        function getSelectedCurveDef(platformName) {
            var ui = uiByPlatform[platformName];
            var idx;
            if (!ui || !ui.dropdown.selection || ui.dropdown.selection.index === 0) {
                return null;
            }
            idx = ui.dropdown.selection.index - 1;
            return PLATFORM_DATA[platformName].curves[idx];
        }

        function updatePreview() {
            var curveDef = getSelectedCurveDef(currentPlatform);
            var lines = [];
            var params;
            var i;
            var paramsObj;

            lines.push('Platform: ' + currentPlatform);
            if (!curveDef) {
                lines.push('Curve: (none)');
                lines.push('Parameters: -');
            } else {
                lines.push('Curve: ' + curveDef.name);
                paramsObj = viewModel.getParams();
                params = curveDef.params;
                if (!params || params.length === 0) {
                    lines.push('Parameters: none');
                } else {
                    lines.push('Parameters:');
                    for (i = 0; i < params.length; i += 1) {
                        lines.push(' - ' + params[i].label + ': ' + paramsObj[params[i].key]);
                    }
                }
            }

            previewText.text = lines.join('\n');
        }

        function clearParamControls(ui) {
            while (ui.paramsPanel.children.length > 0) {
                ui.paramsPanel.remove(ui.paramsPanel.children[0]);
            }
            ui.paramControls = [];
        }

        function dropdownEasingToInternal(value) {
            var v = String(value || 'Ease Out').toLowerCase();
            if (v === 'ease in') {
                return 'easeIn';
            }
            if (v === 'ease in-out') {
                return 'easeInOut';
            }
            return 'easeOut';
        }

        function internalEasingToDropdown(value) {
            var v = normalizeEasingType(value || 'easeOut');
            if (v === 'easeIn') {
                return 'Ease In';
            }
            if (v === 'easeInOut') {
                return 'Ease In-Out';
            }
            return 'Ease Out';
        }

        function buildParameterControls(platformName) {
            var ui = uiByPlatform[platformName];
            var curveDef = getSelectedCurveDef(platformName);
            var hasParams;
            var params;
            var i;
            var param;
            var row;
            var label;
            var valueGroup;
            var slider;
            var input;
            var select;
            var minText;
            var maxText;
            var stepDecimals;

            clearParamControls(ui);

            hasParams = curveDef && curveDef.params && curveDef.params.length > 0;
            ui.paramsPanel.visible = hasParams ? true : false;
            refreshLayout();

            if (!curveDef) {
                return;
            }

            if (!hasParams) {
                updatePreview();
                return;
            }

            params = curveDef.params;

            for (i = 0; i < params.length; i += 1) {
                param = params[i];

                row = ui.paramsPanel.add('group');
                row.orientation = 'column';
                row.alignChildren = ['fill', 'top'];
                row.spacing = 2;

                label = row.add('statictext', undefined, param.label);
                label.alignment = ['left', 'center'];

                if (param.type === 'dropdown') {
                    select = row.add('dropdownlist', undefined, param.options);
                    select.selection = 0;

                    if (param.key === 'easingType') {
                        var easingText = internalEasingToDropdown(viewModel.getParams()[param.key]);
                        var d;
                        for (d = 0; d < param.options.length; d += 1) {
                            if (param.options[d] === easingText) {
                                select.selection = d;
                                break;
                            }
                        }
                    }

                    select.onChange = (function (p, s) {
                        return function () {
                            if (!s.selection) {
                                return;
                            }
                            if (p.key === 'easingType') {
                                viewModel.setParam(p.key, dropdownEasingToInternal(s.selection.text));
                            } else {
                                viewModel.setParam(p.key, s.selection.text);
                            }
                            updatePreview();
                        };
                    }(param, select));

                    ui.paramControls.push({ key: param.key, type: 'dropdown', dropdown: select });
                } else {
                    valueGroup = row.add('group');
                    valueGroup.orientation = 'row';
                    valueGroup.alignChildren = ['fill', 'center'];
                    valueGroup.spacing = 6;

                    minText = valueGroup.add('statictext', undefined, formatNumber(param.min, getDecimals(param.step)));
                    minText.preferredSize = [30, 18];

                    var currentVal = viewModel.getParams()[param.key];
                    if (typeof currentVal !== 'number') {
                        currentVal = param.defaultValue;
                        viewModel.setParam(param.key, currentVal);
                    }

                    slider = valueGroup.add('slider', undefined, currentVal, param.min, param.max);
                    slider.preferredSize = [155, 18];

                    maxText = valueGroup.add('statictext', undefined, formatNumber(param.max, getDecimals(param.step)));
                    maxText.preferredSize = [30, 18];

                    input = valueGroup.add('edittext', undefined, formatNumber(currentVal, getDecimals(param.step)));
                    input.characters = 6;

                    stepDecimals = getDecimals(param.step);

                    slider.onChanging = (function (p, s, e, d) {
                        return function () {
                            var v = roundToStep(s.value, p.step);
                            v = clamp(v, p.min, p.max);
                            viewModel.setParam(p.key, parseFloat(formatNumber(v, d)));
                            e.text = formatNumber(v, d);
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    slider.onChange = (function (p, s, e, d) {
                        return function () {
                            var v = roundToStep(s.value, p.step);
                            v = clamp(v, p.min, p.max);
                            s.value = v;
                            viewModel.setParam(p.key, parseFloat(formatNumber(v, d)));
                            e.text = formatNumber(v, d);
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    input.onChange = (function (p, s, e, d) {
                        return function () {
                            var raw = parseFloat(e.text);
                            var v;
                            if (isNaN(raw)) {
                                raw = viewModel.getParams()[p.key];
                            }
                            v = roundToStep(raw, p.step);
                            v = clamp(v, p.min, p.max);
                            s.value = v;
                            e.text = formatNumber(v, d);
                            viewModel.setParam(p.key, parseFloat(formatNumber(v, d)));
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    ui.paramControls.push({ key: param.key, type: 'slider', slider: slider, input: input });
                }
            }

            refreshLayout();
            updatePreview();
        }

        function buildTabContent(tab, platformName) {
            tab.orientation = 'column';
            tab.alignChildren = ['fill', 'top'];
            tab.spacing = 8;
            tab.margins = 10;

            var curveGroup = tab.add('group');
            curveGroup.orientation = 'column';
            curveGroup.alignChildren = ['fill', 'top'];

            var curveLabel = curveGroup.add('statictext', undefined, 'Curve');
            curveLabel.alignment = ['left', 'top'];

            var curveItems = ['-- Select Curve --'];
            var platformCurves = PLATFORM_DATA[platformName].curves;
            var n;
            for (n = 0; n < platformCurves.length; n += 1) {
                curveItems.push(platformCurves[n].name);
            }

            var curveDropdown = curveGroup.add('dropdownlist', undefined, curveItems);
            curveDropdown.selection = 0;

            var paramsPanel = tab.add('panel', undefined, 'Parameters');
            paramsPanel.alignChildren = ['fill', 'top'];
            paramsPanel.preferredSize = [290, 245];
            paramsPanel.visible = false;

            curveDropdown.onChange = function () {
                var curveDef = getSelectedCurveDef(platformName);
                if (!curveDef) {
                    return;
                }

                viewModel.setPlatform(platformName);
                viewModel.setCurveType(curveDef.name);
                viewModel.setParams(defaultParamsForCurve(curveDef));
                buildParameterControls(platformName);
                if (platformName === currentPlatform) {
                    updatePreview();
                }
            };

            uiByPlatform[platformName] = {
                dropdown: curveDropdown,
                paramsPanel: paramsPanel,
                paramControls: []
            };
        }

        buildTabContent(riveTab, 'Rive');
        buildTabContent(androidTab, 'Android');
        buildTabContent(iosTab, 'iOS');

        var previewPanel = win.add('panel', undefined, 'Curve Preview');
        previewPanel.alignChildren = ['fill', 'top'];
        previewPanel.preferredSize = [310, 150];

        var previewText = previewPanel.add('edittext', undefined, '', { multiline: true, readonly: true });
        previewText.preferredSize = [290, 110];

        var applyButton = win.add('button', undefined, 'Apply to Selected Keyframes');
        applyButton.preferredSize = [310, 32];

        tabs.selection = riveTab;

        tabs.onChange = function () {
            if (!tabs.selection) {
                return;
            }
            currentPlatform = tabs.selection.text;
            updatePreview();
            refreshLayout();
        };

        applyButton.onClick = function () {
            applyToKeyframes(viewModel);
        };

        viewModel.onStateChanged = function () {
            updatePreview();
        };

        viewModel.setPlatform('Rive');
        uiByPlatform.Rive.dropdown.selection = 1;
        uiByPlatform.Rive.dropdown.notify('onChange');

        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };

        refreshLayout();
        return win;
    }

    // Part 7: Apply to Keyframes function
    function applyToKeyframes(viewModel) {
        var comp;
        var selectedProps;
        var expression;
        var i;
        var prop;
        var appliedCount = 0;
        var skipped = [];
        var errors = [];

        if (!app || !app.project) {
            alert('No active project found. Open an After Effects project first.');
            return;
        }

        comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert('Please select an active composition before applying curves.');
            return;
        }

        selectedProps = comp.selectedProperties;
        if (!selectedProps || selectedProps.length === 0) {
            alert('Please select at least one animated property.');
            return;
        }

        try {
            expression = viewModel.generateExpression();
        } catch (generateErr) {
            alert('Unable to generate expression: ' + generateErr.toString());
            return;
        }

        app.beginUndoGroup('Apply Animation Curves Expression');
        try {
            for (i = 0; i < selectedProps.length; i += 1) {
                prop = selectedProps[i];

                if (!prop || prop.propertyType !== PropertyType.PROPERTY) {
                    skipped.push('Item #' + (i + 1) + ': not a property');
                    continue;
                }

                if (!prop.canSetExpression) {
                    skipped.push(prop.name + ': expressions not supported');
                    continue;
                }

                if (prop.numKeys === undefined || prop.numKeys < 1) {
                    skipped.push(prop.name + ': no keyframes');
                    continue;
                }

                try {
                    prop.expression = expression;
                    prop.expressionEnabled = true;
                    appliedCount += 1;
                } catch (applyErr) {
                    errors.push(prop.name + ': ' + applyErr.toString());
                }
            }
        } finally {
            app.endUndoGroup();
        }

        if (appliedCount === 0) {
            var failMessage = 'No expressions were applied.\n';
            if (skipped.length > 0) {
                failMessage += '\nSkipped:\n' + skipped.join('\n');
            }
            if (errors.length > 0) {
                failMessage += '\n\nErrors:\n' + errors.join('\n');
            }
            alert(failMessage);
            return;
        }

        var message = 'Applied expression to ' + appliedCount + ' propert';
        message += (appliedCount === 1) ? 'y.' : 'ies.';

        if (skipped.length > 0 || errors.length > 0) {
            message += '\n\n';
            if (skipped.length > 0) {
                message += 'Skipped:\n' + skipped.join('\n');
            }
            if (errors.length > 0) {
                message += (skipped.length > 0 ? '\n\n' : '') + 'Errors:\n' + errors.join('\n');
            }
        }

        alert(message);
    }

    // Part 8: Main entry point
    function normalizePlatform(platform) {
        var p = String(platform || '').toLowerCase();
        if (p === 'ios') {
            return 'ios';
        }
        if (p === 'android') {
            return 'android';
        }
        if (p === 'rive') {
            return 'rive';
        }
        return p;
    }

    function normalizeCurveType(type) {
        var text = String(type || '').toLowerCase();
        text = text.replace(/\s+/g, ' ');
        text = text.replace(/-/g, '');
        if (text === 'ease in') {
            return 'easein';
        }
        if (text === 'ease out') {
            return 'easeout';
        }
        if (text === 'ease inout' || text === 'ease in out') {
            return 'easeinout';
        }
        if (text === 'accelerate decelerate') {
            return 'acceleratedecelerate';
        }
        if (text === 'anticipate overshoot') {
            return 'anticipateovershoot';
        }
        if (text === 'fast out slow in') {
            return 'fastoutslowin';
        }
        if (text === 'fast out linear in') {
            return 'fastoutlinearin';
        }
        if (text === 'linear out slow in') {
            return 'linearoutslowin';
        }
        if (text === 'ca ease in') {
            return 'ca easein';
        }
        if (text === 'ca ease out') {
            return 'ca easeout';
        }
        if (text === 'ca ease in ease out') {
            return 'ca easeineaseout';
        }
        return text;
    }

    function normalizeEasingType(easingType) {
        var text = String(easingType || 'easeOut').toLowerCase();
        if (text === 'ease in' || text === 'easein') {
            return 'easeIn';
        }
        if (text === 'ease in-out' || text === 'ease inout' || text === 'easeinout') {
            return 'easeInOut';
        }
        return 'easeOut';
    }

    function ensureNumber(value, name, fallback) {
        var v = value;
        if (v === undefined || v === null || v === '') {
            v = fallback;
        }
        v = Number(v);
        if (isNaN(v)) {
            throw new Error('Invalid parameter "' + name + '": expected a number.');
        }
        return v;
    }

    function ensurePositiveNumber(value, name, fallback) {
        var v = ensureNumber(value, name, fallback);
        if (v <= 0) {
            throw new Error('Invalid parameter "' + name + '": must be greater than 0.');
        }
        return v;
    }

    var model = new Model();
    var viewModel = new ViewModel(model);
    var ui = createUI(viewModel);
    if (ui instanceof Window) {
        ui.center();
        ui.show();
    }
}());
