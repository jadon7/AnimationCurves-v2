/*
 * Expression Generator (Phase 1)
 * Generates AE expressions for platform curve templates.
 */

function ExpressionGenerator() {
    this.templates = {
        rive: {
            elastic: this._buildRiveElastic
        },
        android: {
            linear: this._buildAndroidLinear,
            accelerate: this._buildAndroidAccelerate,
            decelerate: this._buildAndroidDecelerate
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

ExpressionGenerator.prototype._buildRiveElastic = function(params) {
    var amplitude = (params.amplitude !== undefined) ? params.amplitude : 1.0;
    var period = (params.period !== undefined) ? params.period : 0.3;
    var easingType = params.easingType || "easeOut";

    return "// Rive - Elastic\n" +
        "// Parameters: amplitude=" + amplitude + ", period=" + period + ", easingType=" + easingType + "\n" +
        "var t = (time - inPoint) / (outPoint - inPoint);\n" +
        "if (t <= 0) t = 0;\n" +
        "if (t >= 1) t = 1;\n" +
        "\n" +
        "var val;\n" +
        "var p = " + period + ";\n" +
        "var a = Math.max(" + amplitude + ", 1.0);\n" +
        "var s = p / (2 * Math.PI) * Math.asin(1 / a);\n" +
        "\n" +
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
        "}\n" +
        "\n" +
        "var startVal = valueAtTime(inPoint);\n" +
        "var endVal = valueAtTime(outPoint);\n" +
        "linear(val, 0, 1, startVal, endVal);\n";
};

ExpressionGenerator.prototype._buildAndroidLinear = function(params) {
    return "// Android - Linear\n" +
        "// Parameters: none\n" +
        "var t = (time - inPoint) / (outPoint - inPoint);\n" +
        "if (t <= 0) t = 0;\n" +
        "if (t >= 1) t = 1;\n" +
        "\n" +
        "var val = t;\n" +
        "\n" +
        "var startVal = valueAtTime(inPoint);\n" +
        "var endVal = valueAtTime(outPoint);\n" +
        "linear(val, 0, 1, startVal, endVal);\n";
};

ExpressionGenerator.prototype._buildAndroidAccelerate = function(params) {
    var factor = (params.factor !== undefined) ? params.factor : 1.0;

    return "// Android - Accelerate\n" +
        "// Parameters: factor=" + factor + "\n" +
        "var t = (time - inPoint) / (outPoint - inPoint);\n" +
        "if (t <= 0) t = 0;\n" +
        "if (t >= 1) t = 1;\n" +
        "\n" +
        "var val;\n" +
        "var factor = " + factor + ";\n" +
        "if (factor === 1.0) {\n" +
        "    val = t * t;\n" +
        "} else {\n" +
        "    val = Math.pow(t, 2 * factor);\n" +
        "}\n" +
        "\n" +
        "var startVal = valueAtTime(inPoint);\n" +
        "var endVal = valueAtTime(outPoint);\n" +
        "linear(val, 0, 1, startVal, endVal);\n";
};

ExpressionGenerator.prototype._buildAndroidDecelerate = function(params) {
    var factor = (params.factor !== undefined) ? params.factor : 1.0;

    return "// Android - Decelerate\n" +
        "// Parameters: factor=" + factor + "\n" +
        "var t = (time - inPoint) / (outPoint - inPoint);\n" +
        "if (t <= 0) t = 0;\n" +
        "if (t >= 1) t = 1;\n" +
        "\n" +
        "var val;\n" +
        "var factor = " + factor + ";\n" +
        "if (factor === 1.0) {\n" +
        "    var oneMinusT = 1 - t;\n" +
        "    val = 1 - oneMinusT * oneMinusT;\n" +
        "} else {\n" +
        "    val = 1 - Math.pow((1 - t), 2 * factor);\n" +
        "}\n" +
        "\n" +
        "var startVal = valueAtTime(inPoint);\n" +
        "var endVal = valueAtTime(outPoint);\n" +
        "linear(val, 0, 1, startVal, endVal);\n";
};
