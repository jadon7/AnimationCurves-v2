// Test script to verify selected keyframe expression generation
// This script tests the expression generator with selected keyframe indices

(function() {
    // Mock the normalization functions
    function normalizePlatform(platform) {
        return String(platform || '').toLowerCase();
    }

    function normalizeCurveType(type) {
        var text = String(type || '').toLowerCase();
        text = text.replace(/\s+/g, ' ');
        text = text.replace(/-/g, '');
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

    // Simple expression generator for testing
    function ExpressionGenerator() {}

    ExpressionGenerator.prototype._composeExpression = function (title, paramsLine, curveCode, timingConfig, selectedKeyIndices) {
        var config = timingConfig || {};
        var usePhysicalDuration = config.usePhysicalDuration === true;
        var fixedDuration = (typeof config.duration === 'number' && config.duration > 0) ? config.duration : 1.0;

        var keyframeLogic = "// Check if there are enough keyframes\n" +
            "if (numKeys < 2) {\n" +
            "  value;\n" +
            "} else {\n" +
            "  // Find which keyframe segment we're in\n" +
            "  var n = 0;\n" +
            "  if (numKeys > 0) {\n" +
            "    n = nearestKey(time).index;\n" +
            "    if (key(n).time > time) {\n" +
            "      n--;\n" +
            "    }\n" +
            "  }\n" +
            "\n" +
            "  // Boundary handling\n" +
            "  if (n === 0) {\n" +
            "    valueAtTime(key(1).time);\n" +
            "  } else if (n === numKeys) {\n" +
            "    valueAtTime(key(numKeys).time);\n" +
            "  } else {\n" +
            "    // Get current segment keyframes\n" +
            "    var key1 = key(n);\n" +
            "    var key2 = key(n + 1);\n" +
            "    var inPoint_k = key1.time;\n" +
            "    var outPoint_k = key2.time;\n" +
            "    var startVal = key1.value;\n" +
            "    var endVal = key2.value;\n" +
            "\n";

        // Add selected keyframe check if indices are provided
        if (selectedKeyIndices && selectedKeyIndices.length > 0) {
            keyframeLogic += "    // Check if this segment should use the curve\n" +
                "    var useCurve = false;\n";

            var i;
            for (i = 0; i < selectedKeyIndices.length; i += 1) {
                if (i === 0) {
                    keyframeLogic += "    if (n === " + selectedKeyIndices[i];
                } else {
                    keyframeLogic += " || n === " + selectedKeyIndices[i];
                }
            }
            keyframeLogic += ") {\n" +
                "      useCurve = true;\n" +
                "    }\n" +
                "\n" +
                "    if (useCurve) {\n";
        }

        keyframeLogic += "    // Calculate segment duration and progress t (0 to 1)\n";

        if (usePhysicalDuration) {
            keyframeLogic += "    var duration = " + fixedDuration + ";\n";
        } else {
            keyframeLogic += "    var duration = outPoint_k - inPoint_k;\n";
        }

        keyframeLogic += "    var t = (duration <= 0) ? 1 : (time - inPoint_k) / duration;\n" +
            "    if (t <= 0) t = 0;\n" +
            "    if (t >= 1) t = 1;\n" +
            "\n" +
            "    // Curve calculation\n" +
            "    var val;\n" +
            curveCode +
            "\n" +
            "    // Output final interpolation\n" +
            "    startVal + (endVal - startVal) * val;\n";

        // Close the useCurve conditional if we added it
        if (selectedKeyIndices && selectedKeyIndices.length > 0) {
            keyframeLogic += "    } else {\n" +
                "      // Use linear interpolation for non-selected segments\n" +
                "      value;\n" +
                "    }\n";
        }

        keyframeLogic += "  }\n" +
            "}\n";

        return "// " + title + "\n" +
            "// Parameters: " + paramsLine + "\n" +
            keyframeLogic;
    };

    ExpressionGenerator.prototype._buildRiveElastic = function (params, selectedKeyIndices) {
        var amplitude = (params.amplitude !== undefined) ? params.amplitude : 1.0;
        var period = (params.period !== undefined) ? params.period : 0.3;
        var easingType = normalizeEasingType(params.easingType || 'easeOut');
        var curveCode = "    var p = " + period + ";\n" +
            "    var a = Math.max(" + amplitude + ", 1.0);\n" +
            "    var s = p / (2 * Math.PI) * Math.asin(1 / a);\n" +
            "    var easeType = \"" + easingType + "\";\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (easeType === \"easeOut\") {\n" +
            "      val = a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;\n" +
            "    } else if (easeType === \"easeIn\") {\n" +
            "      val = -(a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));\n" +
            "    } else {\n" +
            "      var t2 = t * 2;\n" +
            "      if (t2 < 1) {\n" +
            "        val = -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));\n" +
            "      } else {\n" +
            "        val = a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;\n" +
            "      }\n" +
            "    }\n";

        return this._composeExpression(
            'Rive - Elastic',
            'amplitude=' + amplitude + ', period=' + period + ', easingType=' + easingType,
            curveCode,
            undefined,
            selectedKeyIndices
        );
    };

    // Test 1: Expression without selected keyframes (should work as before)
    var gen = new ExpressionGenerator();
    var expr1 = gen._buildRiveElastic({ amplitude: 1.0, period: 0.3, easingType: 'easeOut' });
    alert("Test 1 - No selected keyframes:\n\n" + expr1);

    // Test 2: Expression with single selected keyframe
    var expr2 = gen._buildRiveElastic({ amplitude: 1.0, period: 0.3, easingType: 'easeOut' }, [2]);
    alert("Test 2 - Single selected keyframe (keyframe 2):\n\n" + expr2);

    // Test 3: Expression with multiple selected keyframes
    var expr3 = gen._buildRiveElastic({ amplitude: 1.0, period: 0.3, easingType: 'easeOut' }, [1, 3, 5]);
    alert("Test 3 - Multiple selected keyframes (1, 3, 5):\n\n" + expr3);
})();
