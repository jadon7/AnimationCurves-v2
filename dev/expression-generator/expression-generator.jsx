/*
 * Expression Generator (Phase 2)
 * Generates AE expressions for all supported platform curve templates.
 */

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

ExpressionGenerator.prototype.generate = function(platform, curveType, params) {
    var p = (platform || "").toLowerCase();
    var c = (curveType || "").toLowerCase();
    var normalizedParams = params || {};

    if (!this.templates[p] || !this.templates[p][c]) {
        throw new Error("Unsupported curve: " + platform + " / " + curveType);
    }

    return this.templates[p][c](normalizedParams);
};

ExpressionGenerator.prototype._composeExpression = function(title, paramsLine, curveCode) {
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

ExpressionGenerator.prototype._buildCubicBezierCode = function(x1, y1, x2, y2) {
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

ExpressionGenerator.prototype._buildRiveElastic = function(params) {
    var amplitude = (params.amplitude !== undefined) ? params.amplitude : 1.0;
    var period = (params.period !== undefined) ? params.period : 0.3;
    var easingType = params.easingType || "easeOut";
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
        "Rive - Elastic",
        "amplitude=" + amplitude + ", period=" + period + ", easingType=" + easingType,
        curveCode
    );
};

ExpressionGenerator.prototype._buildAndroidLinear = function(params) {
    return this._composeExpression(
        "Android - Linear",
        "none",
        "val = t;\n"
    );
};

ExpressionGenerator.prototype._buildAndroidAccelerate = function(params) {
    var factor = (params.factor !== undefined) ? params.factor : 1.0;
    var curveCode = "var factor = " + factor + ";\n" +
        "if (factor === 1.0) {\n" +
        "    val = t * t;\n" +
        "} else {\n" +
        "    val = Math.pow(t, 2 * factor);\n" +
        "}\n";

    return this._composeExpression("Android - Accelerate", "factor=" + factor, curveCode);
};

ExpressionGenerator.prototype._buildAndroidDecelerate = function(params) {
    var factor = (params.factor !== undefined) ? params.factor : 1.0;
    var curveCode = "var factor = " + factor + ";\n" +
        "if (factor === 1.0) {\n" +
        "    var oneMinusT = 1 - t;\n" +
        "    val = 1 - oneMinusT * oneMinusT;\n" +
        "} else {\n" +
        "    val = 1 - Math.pow((1 - t), 2 * factor);\n" +
        "}\n";

    return this._composeExpression("Android - Decelerate", "factor=" + factor, curveCode);
};

ExpressionGenerator.prototype._buildAndroidAccelerateDecelerate = function(params) {
    return this._composeExpression(
        "Android - AccelerateDecelerate",
        "none",
        "val = Math.cos((t + 1) * Math.PI) / 2 + 0.5;\n"
    );
};

ExpressionGenerator.prototype._buildAndroidAnticipate = function(params) {
    var tension = (params.tension !== undefined) ? params.tension : 2.0;
    var curveCode = "var tension = " + tension + ";\n" +
        "val = t * t * ((tension + 1) * t - tension);\n";

    return this._composeExpression("Android - Anticipate", "tension=" + tension, curveCode);
};

ExpressionGenerator.prototype._buildAndroidOvershoot = function(params) {
    var tension = (params.tension !== undefined) ? params.tension : 2.0;
    var curveCode = "var tension = " + tension + ";\n" +
        "var x = t - 1;\n" +
        "val = x * x * ((tension + 1) * x + tension) + 1;\n";

    return this._composeExpression("Android - Overshoot", "tension=" + tension, curveCode);
};

ExpressionGenerator.prototype._buildAndroidAnticipateOvershoot = function(params) {
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

    return this._composeExpression("Android - AnticipateOvershoot", "tension=" + tension, curveCode);
};

ExpressionGenerator.prototype._buildAndroidBounce = function(params) {
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

    return this._composeExpression("Android - Bounce", "none", curveCode);
};

ExpressionGenerator.prototype._buildAndroidFastOutSlowIn = function(params) {
    return this._composeExpression(
        "Android - FastOutSlowIn",
        "none",
        this._buildCubicBezierCode(0.4, 0.0, 0.2, 1.0)
    );
};

ExpressionGenerator.prototype._buildAndroidFastOutLinearIn = function(params) {
    return this._composeExpression(
        "Android - FastOutLinearIn",
        "none",
        this._buildCubicBezierCode(0.4, 0.0, 1.0, 1.0)
    );
};

ExpressionGenerator.prototype._buildAndroidLinearOutSlowIn = function(params) {
    return this._composeExpression(
        "Android - LinearOutSlowIn",
        "none",
        this._buildCubicBezierCode(0.0, 0.0, 0.2, 1.0)
    );
};

ExpressionGenerator.prototype._buildIOSLinear = function(params) {
    return this._composeExpression("iOS - Linear", "none", "val = t;\n");
};

ExpressionGenerator.prototype._buildIOSDefault = function(params) {
    var curveCode = "if (t < 0.5) {\n" +
        "    val = 2 * t * t;\n" +
        "} else {\n" +
        "    val = 1 - Math.pow(-2 * t + 2, 2) / 2;\n" +
        "}\n";

    return this._composeExpression("iOS - Default", "none", curveCode);
};

ExpressionGenerator.prototype._buildIOSEaseIn = function(params) {
    return this._composeExpression("iOS - EaseIn", "none", "val = t * t;\n");
};

ExpressionGenerator.prototype._buildIOSEaseOut = function(params) {
    var curveCode = "var oneMinusT = 1 - t;\n" +
        "val = 1 - oneMinusT * oneMinusT;\n";

    return this._composeExpression("iOS - EaseOut", "none", curveCode);
};

ExpressionGenerator.prototype._buildIOSEaseInOut = function(params) {
    var curveCode = "if (t < 0.5) {\n" +
        "    val = 2 * t * t;\n" +
        "} else {\n" +
        "    val = 1 - Math.pow(-2 * t + 2, 2) / 2;\n" +
        "}\n";

    return this._composeExpression("iOS - EaseInOut", "none", curveCode);
};

ExpressionGenerator.prototype._buildIOSSpringCode = function(damping, velocity, duration) {
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

ExpressionGenerator.prototype._buildIOSSpringDefault = function(params) {
    var damping = (params.damping !== undefined) ? params.damping : 0.8;
    var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
    var duration = (params.duration !== undefined) ? params.duration : 1.0;
    var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

    return this._composeExpression(
        "iOS - Spring Default",
        "damping=" + damping + ", velocity=" + velocity + ", duration=" + duration,
        curveCode
    );
};

ExpressionGenerator.prototype._buildIOSSpringGentle = function(params) {
    var damping = (params.damping !== undefined) ? params.damping : 0.9;
    var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
    var duration = (params.duration !== undefined) ? params.duration : 1.0;
    var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

    return this._composeExpression(
        "iOS - Spring Gentle",
        "damping=" + damping + ", velocity=" + velocity + ", duration=" + duration,
        curveCode
    );
};

ExpressionGenerator.prototype._buildIOSSpringBouncy = function(params) {
    var damping = (params.damping !== undefined) ? params.damping : 0.5;
    var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
    var duration = (params.duration !== undefined) ? params.duration : 1.0;
    var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

    return this._composeExpression(
        "iOS - Spring Bouncy",
        "damping=" + damping + ", velocity=" + velocity + ", duration=" + duration,
        curveCode
    );
};

ExpressionGenerator.prototype._buildIOSSpringCustom = function(params) {
    var damping = (params.damping !== undefined) ? params.damping : 0.7;
    var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
    var duration = (params.duration !== undefined) ? params.duration : 1.0;
    var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

    return this._composeExpression(
        "iOS - Spring Custom",
        "damping=" + damping + ", velocity=" + velocity + ", duration=" + duration,
        curveCode
    );
};

ExpressionGenerator.prototype._buildIOSCADefault = function(params) {
    return this._composeExpression(
        "iOS - CA Default",
        "none",
        this._buildCubicBezierCode(0.25, 0.1, 0.25, 1.0)
    );
};

ExpressionGenerator.prototype._buildIOSCAEaseIn = function(params) {
    return this._composeExpression(
        "iOS - CA EaseIn",
        "none",
        this._buildCubicBezierCode(0.42, 0.0, 1.0, 1.0)
    );
};

ExpressionGenerator.prototype._buildIOSCAEaseOut = function(params) {
    return this._composeExpression(
        "iOS - CA EaseOut",
        "none",
        this._buildCubicBezierCode(0.0, 0.0, 0.58, 1.0)
    );
};

ExpressionGenerator.prototype._buildIOSCAEaseInEaseOut = function(params) {
    return this._composeExpression(
        "iOS - CA EaseInEaseOut",
        "none",
        this._buildCubicBezierCode(0.42, 0.0, 0.58, 1.0)
    );
};

ExpressionGenerator.prototype._buildIOSCALinear = function(params) {
    return this._composeExpression(
        "iOS - CA Linear",
        "none",
        this._buildCubicBezierCode(0.0, 0.0, 1.0, 1.0)
    );
};
