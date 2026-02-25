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
                elastic: this._buildRiveElastic
            },
            ios: {
                "spring default": this._buildIOSSpringDefault,
                "spring gentle": this._buildIOSSpringGentle,
                "spring bouncy": this._buildIOSSpringBouncy,
                "spring custom": this._buildIOSSpringCustom
            },
            folme: {
                spring: this._buildFolmeSpring
            },
            android: {
                spring: this._buildAndroidSpring
            }
        };
    }

    ExpressionGenerator.prototype.generate = function (platform, curveType, params, selectedKeyIndices) {
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

        return builder.call(this, normalizedParams, selectedKeyIndices);
    };

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
        var period = (params.period !== undefined) ? params.period : 1.0;
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

    ExpressionGenerator.prototype._buildIOSSpringCode = function (damping, velocity) {
        return "    var damping = " + damping + ";\n" +
            "    var velocity = " + velocity + ";\n" +
            "    var referenceDuration = 1.0;\n" +
            "    var omega = 12;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else {\n" +
            "      var tau = t * referenceDuration;\n" +
            "      var envelope = Math.exp(-damping * omega * tau);\n" +
            "      var sinCoeff = damping + velocity;\n" +
            "      val = 1 - envelope * (Math.cos(omega * tau) + sinCoeff * Math.sin(omega * tau));\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildIOSSpringDefault = function (params, selectedKeyIndices) {
        var damping = (params.damping !== undefined) ? params.damping : 0.8;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity);

        return this._composeExpression(
            'iOS - Spring Default',
            'damping=' + damping + ', velocity=' + velocity,
            curveCode,
            { usePhysicalDuration: true, duration: 1.0 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringGentle = function (params, selectedKeyIndices) {
        var damping = (params.damping !== undefined) ? params.damping : 0.9;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity);

        return this._composeExpression(
            'iOS - Spring Gentle',
            'damping=' + damping + ', velocity=' + velocity,
            curveCode,
            { usePhysicalDuration: true, duration: 1.0 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringBouncy = function (params, selectedKeyIndices) {
        var damping = (params.damping !== undefined) ? params.damping : 0.5;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity);

        return this._composeExpression(
            'iOS - Spring Bouncy',
            'damping=' + damping + ', velocity=' + velocity,
            curveCode,
            { usePhysicalDuration: true, duration: 1.0 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringCustom = function (params, selectedKeyIndices) {
        var damping = (params.damping !== undefined) ? params.damping : 0.7;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity);

        return this._composeExpression(
            'iOS - Spring Custom',
            'damping=' + damping + ', velocity=' + velocity,
            curveCode,
            { usePhysicalDuration: true, duration: 1.0 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildFolmeSpringCode = function (damping, response) {
        return "    var damping = " + damping + ";\n" +
            "    var response = " + response + ";\n" +
            "    var referenceDuration = 1.0;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else {\n" +
            "      var mass = 1;\n" +
            "      var tension = Math.pow(2 * Math.PI / response, 2) * mass;\n" +
            "      var dampingCoeff = 4 * Math.PI * damping * mass / response;\n" +
            "      dampingCoeff = Math.min(dampingCoeff, 60);\n" +
            "      var physicsTime = t * referenceDuration;\n" +
            "      var dt = 0.001;\n" +
            "      var steps = Math.floor(physicsTime / dt);\n" +
            "      var value = 0;\n" +
            "      var speed = 0;\n" +
            "      var target = 1;\n" +
            "      for (var i = 0; i < steps; i++) {\n" +
            "        var f = 0;\n" +
            "        f -= speed * dampingCoeff;\n" +
            "        f += (tension * (target - value));\n" +
            "        speed += f * dt;\n" +
            "        value += speed * dt;\n" +
            "      }\n" +
            "      val = value;\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildFolmeSpring = function (params, selectedKeyIndices) {
        var damping = (params.damping !== undefined) ? params.damping : 0.95;
        var response = (params.response !== undefined) ? params.response : 0.35;
        var referenceDuration = 1.0;
        var curveCode = this._buildFolmeSpringCode(damping, response);

        return this._composeExpression(
            'Folme - Spring',
            'damping=' + damping + ', response=' + response,
            curveCode,
            { usePhysicalDuration: true, duration: referenceDuration },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildAndroidSpringCode = function (tension, friction) {
        return "    var tension = " + tension + ";\n" +
            "    var friction = " + friction + ";\n" +
            "    var delta = friction * friction - 4 * tension;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (delta > 0) {\n" +
            "      var r1 = (-friction + Math.sqrt(delta)) / 2;\n" +
            "      var r2 = (-friction - Math.sqrt(delta)) / 2;\n" +
            "      var C1 = r2 / (r1 - r2);\n" +
            "      var C2 = -1 - C1;\n" +
            "      val = 1 + C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);\n" +
            "    } else if (delta === 0) {\n" +
            "      var r = -friction / 2;\n" +
            "      val = 1 + (-1 - r * t) * Math.exp(r * t);\n" +
            "    } else {\n" +
            "      var omega = Math.sqrt(4 * tension - friction * friction) / 2;\n" +
            "      var B = -friction / (2 * omega);\n" +
            "      val = 1 - Math.exp(-friction * t / 2) * (Math.cos(omega * t) + B * Math.sin(omega * t));\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildAndroidSpring = function (params, selectedKeyIndices) {
        var tension = (params.tension !== undefined) ? params.tension : 160.0;
        var friction = (params.friction !== undefined) ? params.friction : 18.0;
        var curveCode = this._buildAndroidSpringCode(tension, friction);

        return this._composeExpression(
            'Android - SpringInterpolator',
            'tension=' + tension + ', friction=' + friction,
            curveCode,
            undefined,
            selectedKeyIndices
        );
    };

    // Part 3: Data Model
    function Model() {
