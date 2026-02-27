    // Part 1: Curve Mathematics

    // Utility functions
    function normalizePlatform(platform) {
        var p = String(platform || '').toLowerCase();
        if (p === 'ios') {
            return 'ios';
        }
        if (p === 'folme') {
            return 'folme';
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
        this.period = (typeof period === 'number' && period > 0) ? period : 1.0;
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

    function IOSDurationBounceCurve(duration, bounce) {
        this.duration = (typeof duration === 'number' && duration > 0) ? duration : 0.2;
        this.bounce = (typeof bounce === 'number') ? Math.max(-1, Math.min(1, bounce)) : 0.2;
    }

    IOSDurationBounceCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) return 0;
        if (clampedT === 1) return 1;

        var dampingFraction = 1.0 - this.bounce;
        var omega = 2 * Math.PI / this.duration;
        var tau = clampedT * this.duration * 2;
        var envelope;

        if (dampingFraction < 1) {
            var omegaD = omega * Math.sqrt(1 - dampingFraction * dampingFraction);
            envelope = Math.exp(-dampingFraction * omega * tau);
            return 1 - envelope * (Math.cos(omegaD * tau) + (dampingFraction * omega / omegaD) * Math.sin(omegaD * tau));
        }
        envelope = Math.exp(-omega * tau);
        return 1 - envelope * (1 + omega * tau);
    };

    function IOSResponseDampingCurve(response, dampingFraction) {
        this.response = (typeof response === 'number' && response > 0) ? response : 0.3;
        this.dampingFraction = (typeof dampingFraction === 'number') ? Math.max(dampingFraction, 0) : 0.2;
    }

    IOSResponseDampingCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) return 0;
        if (clampedT === 1) return 1;

        var omega = 2 * Math.PI / this.response;
        var zeta = this.dampingFraction;
        var tau = clampedT * this.response * 3;
        var envelope, omegaD, r1, r2, C1, C2;

        if (zeta < 1) {
            omegaD = omega * Math.sqrt(1 - zeta * zeta);
            envelope = Math.exp(-zeta * omega * tau);
            return 1 - envelope * (Math.cos(omegaD * tau) + (zeta * omega / omegaD) * Math.sin(omegaD * tau));
        }
        if (zeta === 1) {
            envelope = Math.exp(-omega * tau);
            return 1 - envelope * (1 + omega * tau);
        }
        r1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
        r2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
        C1 = r2 / (r2 - r1);
        C2 = -r1 / (r2 - r1);
        return 1 - C1 * Math.exp(r1 * tau) - C2 * Math.exp(r2 * tau);
    };

    function IOSPhysicsCurve(mass, stiffness, damping) {
        this.mass = (typeof mass === 'number' && mass > 0) ? mass : 1.0;
        this.stiffness = (typeof stiffness === 'number' && stiffness > 0) ? stiffness : 200.0;
        this.damping = (typeof damping === 'number') ? Math.max(damping, 0) : 20.0;
    }

    IOSPhysicsCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) return 0;
        if (clampedT === 1) return 1;

        var z = this.damping / (2 * Math.sqrt(this.stiffness * this.mass));
        var w = Math.sqrt(this.stiffness / this.mass);
        var v = 0; // initialVelocity
        var s = -1; // from(0) - to(1)
        var c = w * z;
        var a = w * Math.sqrt(Math.abs(1 - z * z));

        // Calculate settling time based on damping regime
        var settlingTime;
        if (z < 1) {
            settlingTime = 4.0 / (Math.max(z, 0.001) * w);
        } else if (z === 1) {
            settlingTime = 4.0 / w;
        } else {
            var slowRoot = w * (z - Math.sqrt(z * z - 1));
            settlingTime = 4.0 / slowRoot;
        }
        if (settlingTime < 0.1) settlingTime = 0.1;
        if (settlingTime > 10.0) settlingTime = 10.0;
        var tau = clampedT * settlingTime;

        var A, B, expVal;
        if (z > 1) {
            // Overdamped - use cosh/sinh expanded
            A = a * s;
            B = v + c * s;
            var ePos = Math.exp(a * tau);
            var eNeg = Math.exp(-a * tau);
            var coshVal = (ePos + eNeg) / 2;
            var sinhVal = (ePos - eNeg) / 2;
            expVal = Math.exp(-c * tau);
            return 1 + (expVal * (A * coshVal + B * sinhVal)) / a;
        } else if (z === 1) {
            // Critically damped
            A = s;
            B = v + c * s;
            expVal = Math.exp(-c * tau);
            return 1 + expVal * (A + B * tau);
        } else {
            // Underdamped
            A = s;
            B = (v + c * s) / a;
            expVal = Math.exp(-c * tau);
            return 1 + expVal * (A * Math.cos(a * tau) + B * Math.sin(a * tau));
        }
    };

    function FolmeSpringCurve(damping, response) {
        this.damping = (typeof damping === 'number') ? damping : 0.95;
        this.response = (typeof response === 'number' && response > 0) ? response : 0.35;
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
        var referenceDuration = 1.0; // Fixed 1 second reference time

        var mass = 1;
        var tension = Math.pow(2 * Math.PI / response, 2) * mass;
        var dampingCoeff = 4 * Math.PI * damping * mass / response;
        dampingCoeff = Math.min(dampingCoeff, 60);

        var physicsTime = clampedT * referenceDuration;
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

    function AndroidSpringCurve(stiffness, dampingRatio) {
        this.stiffness = (typeof stiffness === 'number' && stiffness > 0) ? stiffness : 450.0;
        this.dampingRatio = (typeof dampingRatio === 'number' && dampingRatio >= 0) ? dampingRatio : 0.5;
    }

    AndroidSpringCurve.prototype.getValue = function (t) {
        var clampedT = clamp01(t);
        if (clampedT === 0) return 0;
        if (clampedT === 1) return 1;

        var z = this.dampingRatio;
        var w = Math.sqrt(this.stiffness);
        var v = 0; // startVelocity
        var s = -1; // from(0) - to(1)
        var c = w * z;
        var a = w * Math.sqrt(Math.abs(1 - z * z));

        // Calculate settling time based on damping regime
        var settlingTime;
        if (z < 1) {
            settlingTime = 4.0 / (Math.max(z, 0.001) * w);
        } else if (z === 1) {
            settlingTime = 4.0 / w;
        } else {
            var slowRoot = w * (z - Math.sqrt(z * z - 1));
            settlingTime = 4.0 / slowRoot;
        }
        if (settlingTime < 0.1) settlingTime = 0.1;
        if (settlingTime > 10.0) settlingTime = 10.0;
        var tau = clampedT * settlingTime;

        var A, B, expVal;
        if (z > 1) {
            // Overdamped - use cosh/sinh expanded
            A = a * s;
            B = v + c * s;
            var ePos = Math.exp(a * tau);
            var eNeg = Math.exp(-a * tau);
            var coshVal = (ePos + eNeg) / 2;
            var sinhVal = (ePos - eNeg) / 2;
            expVal = Math.exp(-c * tau);
            return 1 + (expVal * (A * coshVal + B * sinhVal)) / a;
        } else if (z === 1) {
            // Critically damped
            A = s;
            B = v + c * s;
            expVal = Math.exp(-c * tau);
            return 1 + expVal * (A + B * tau);
        } else {
            // Underdamped
            A = s;
            B = (v + c * s) / a;
            expVal = Math.exp(-c * tau);
            return 1 + expVal * (A * Math.cos(a * tau) + B * Math.sin(a * tau));
        }
    };

    // Part 2: Expression Generator
    function ExpressionGenerator() {
        this.templates = {
            rive: {
                elastic: this._buildRiveElastic
            },
            ios: {
                "duration + bounce": this._buildIOSDurationBounce,
                "response + damping": this._buildIOSResponseDamping,
                "physics": this._buildIOSPhysics
            },
            folme: {
                spring: this._buildFolmeSpring
            },
            android: {
                spring: this._buildAndroidSpring,
                fling: this._buildAndroidFling
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

    ExpressionGenerator.prototype._buildIOSDurationBounce = function (params, selectedKeyIndices) {
        var duration = (params.duration !== undefined) ? params.duration : 0.2;
        var bounce = (params.bounce !== undefined) ? params.bounce : 0.2;
        var curveCode = "    var dur = " + duration + ";\n" +
            "    var bounce = " + bounce + ";\n" +
            "    var dampingFraction = 1.0 - bounce;\n" +
            "    var omega = 2 * Math.PI / dur;\n" +
            "    var tau = t * dur * 2;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (dampingFraction < 1) {\n" +
            "      var omegaD = omega * Math.sqrt(1 - dampingFraction * dampingFraction);\n" +
            "      var env = Math.exp(-dampingFraction * omega * tau);\n" +
            "      val = 1 - env * (Math.cos(omegaD * tau) + (dampingFraction * omega / omegaD) * Math.sin(omegaD * tau));\n" +
            "    } else {\n" +
            "      var env = Math.exp(-omega * tau);\n" +
            "      val = 1 - env * (1 + omega * tau);\n" +
            "    }\n";

        return this._composeExpression(
            'iOS - Duration + Bounce',
            'duration=' + duration + ', bounce=' + bounce,
            curveCode,
            { usePhysicalDuration: true, duration: duration * 2 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildIOSResponseDamping = function (params, selectedKeyIndices) {
        var response = (params.response !== undefined) ? params.response : 0.3;
        var dampingFraction = (params.dampingFraction !== undefined) ? params.dampingFraction : 0.2;
        var curveCode = "    var resp = " + response + ";\n" +
            "    var zeta = " + dampingFraction + ";\n" +
            "    var omega = 2 * Math.PI / resp;\n" +
            "    var tau = t * resp * 3;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (zeta < 1) {\n" +
            "      var omegaD = omega * Math.sqrt(1 - zeta * zeta);\n" +
            "      var env = Math.exp(-zeta * omega * tau);\n" +
            "      val = 1 - env * (Math.cos(omegaD * tau) + (zeta * omega / omegaD) * Math.sin(omegaD * tau));\n" +
            "    } else if (zeta === 1) {\n" +
            "      var env = Math.exp(-omega * tau);\n" +
            "      val = 1 - env * (1 + omega * tau);\n" +
            "    } else {\n" +
            "      var r1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));\n" +
            "      var r2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));\n" +
            "      var C1 = r2 / (r2 - r1);\n" +
            "      var C2 = -r1 / (r2 - r1);\n" +
            "      val = 1 - C1 * Math.exp(r1 * tau) - C2 * Math.exp(r2 * tau);\n" +
            "    }\n";

        return this._composeExpression(
            'iOS - Response + Damping',
            'response=' + response + ', dampingFraction=' + dampingFraction,
            curveCode,
            { usePhysicalDuration: true, duration: response * 3 },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildIOSPhysics = function (params, selectedKeyIndices) {
        var mass = (params.mass !== undefined) ? params.mass : 1.0;
        var stiffness = (params.stiffness !== undefined) ? params.stiffness : 200.0;
        var damping = (params.damping !== undefined) ? params.damping : 20.0;
        var curveCode = "    var mass = " + mass + ";\n" +
            "    var stiffness = " + stiffness + ";\n" +
            "    var damp = " + damping + ";\n" +
            "    var z = damp / (2 * Math.sqrt(stiffness * mass));\n" +
            "    var w = Math.sqrt(stiffness / mass);\n" +
            "    var v = 0;\n" +
            "    var s = -1;\n" +
            "    var c = w * z;\n" +
            "    var a = w * Math.sqrt(Math.abs(1 - z * z));\n" +
            "    var sTime;\n" +
            "    if (z < 1) {\n" +
            "      sTime = 4.0 / (Math.max(z, 0.001) * w);\n" +
            "    } else if (z === 1) {\n" +
            "      sTime = 4.0 / w;\n" +
            "    } else {\n" +
            "      sTime = 4.0 / (w * (z - Math.sqrt(z * z - 1)));\n" +
            "    }\n" +
            "    if (sTime < 0.1) sTime = 0.1;\n" +
            "    if (sTime > 10.0) sTime = 10.0;\n" +
            "    var tau = t * sTime;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (z > 1) {\n" +
            "      var A = a * s;\n" +
            "      var B = v + c * s;\n" +
            "      var ePos = Math.exp(a * tau);\n" +
            "      var eNeg = Math.exp(-a * tau);\n" +
            "      var coshVal = (ePos + eNeg) / 2;\n" +
            "      var sinhVal = (ePos - eNeg) / 2;\n" +
            "      val = 1 + (Math.exp(-c * tau) * (A * coshVal + B * sinhVal)) / a;\n" +
            "    } else if (z === 1) {\n" +
            "      var A = s;\n" +
            "      var B = v + c * s;\n" +
            "      val = 1 + Math.exp(-c * tau) * (A + B * tau);\n" +
            "    } else {\n" +
            "      var A = s;\n" +
            "      var B = (v + c * s) / a;\n" +
            "      val = 1 + Math.exp(-c * tau) * (A * Math.cos(a * tau) + B * Math.sin(a * tau));\n" +
            "    }\n";

        // Calculate settling time to match curve code's sTime
        var w = Math.sqrt(stiffness / mass);
        var z = damping / (2 * Math.sqrt(stiffness * mass));
        var sTime;
        if (z < 1) {
            sTime = 4.0 / (Math.max(z, 0.001) * w);
        } else if (z === 1) {
            sTime = 4.0 / w;
        } else {
            sTime = 4.0 / (w * (z - Math.sqrt(z * z - 1)));
        }
        if (sTime < 0.1) sTime = 0.1;
        if (sTime > 10.0) sTime = 10.0;

        return this._composeExpression(
            'iOS - Physics',
            'mass=' + mass + ', stiffness=' + stiffness + ', damping=' + damping,
            curveCode,
            { usePhysicalDuration: true, duration: sTime },
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

    ExpressionGenerator.prototype._buildAndroidSpringCode = function (stiffness, dampingRatio) {
        return "    var z = " + dampingRatio + ";\n" +
            "    var w = Math.sqrt(" + stiffness + ");\n" +
            "    var v = 0;\n" +
            "    var s = -1;\n" +
            "    var c = w * z;\n" +
            "    var a = w * Math.sqrt(Math.abs(1 - z * z));\n" +
            "    var sTime;\n" +
            "    if (z < 1) {\n" +
            "      sTime = 4.0 / (Math.max(z, 0.001) * w);\n" +
            "    } else if (z === 1) {\n" +
            "      sTime = 4.0 / w;\n" +
            "    } else {\n" +
            "      sTime = 4.0 / (w * (z - Math.sqrt(z * z - 1)));\n" +
            "    }\n" +
            "    if (sTime < 0.1) sTime = 0.1;\n" +
            "    if (sTime > 10.0) sTime = 10.0;\n" +
            "    var tau = t * sTime;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else if (z > 1) {\n" +
            "      var A = a * s;\n" +
            "      var B = v + c * s;\n" +
            "      var ePos = Math.exp(a * tau);\n" +
            "      var eNeg = Math.exp(-a * tau);\n" +
            "      var coshVal = (ePos + eNeg) / 2;\n" +
            "      var sinhVal = (ePos - eNeg) / 2;\n" +
            "      val = 1 + (Math.exp(-c * tau) * (A * coshVal + B * sinhVal)) / a;\n" +
            "    } else if (z === 1) {\n" +
            "      var A = s;\n" +
            "      var B = v + c * s;\n" +
            "      val = 1 + Math.exp(-c * tau) * (A + B * tau);\n" +
            "    } else {\n" +
            "      var A = s;\n" +
            "      var B = (v + c * s) / a;\n" +
            "      val = 1 + Math.exp(-c * tau) * (A * Math.cos(a * tau) + B * Math.sin(a * tau));\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildAndroidSpring = function (params, selectedKeyIndices) {
        var stiffness = (params.stiffness !== undefined) ? params.stiffness : 450.0;
        var dampingRatio = (params.dampingRatio !== undefined) ? params.dampingRatio : 0.5;
        var curveCode = this._buildAndroidSpringCode(stiffness, dampingRatio);

        // Calculate settling time to match curve code's sTime
        var w = Math.sqrt(stiffness);
        var z = dampingRatio;
        var sTime;
        if (z < 1) {
            sTime = 4.0 / (Math.max(z, 0.001) * w);
        } else if (z === 1) {
            sTime = 4.0 / w;
        } else {
            sTime = 4.0 / (w * (z - Math.sqrt(z * z - 1)));
        }
        if (sTime < 0.1) sTime = 0.1;
        if (sTime > 10.0) sTime = 10.0;

        return this._composeExpression(
            'Android - SpringAnimation',
            'stiffness=' + stiffness + ', dampingRatio=' + dampingRatio,
            curveCode,
            { usePhysicalDuration: true, duration: sTime },
            selectedKeyIndices
        );
    };

    ExpressionGenerator.prototype._buildAndroidFlingCode = function (startVelocity, friction) {
        return "    var velocity = Math.abs(" + startVelocity + ");\n" +
            "    var frictionCoeff = " + friction + " * -4.2;\n" +
            "    var threshold = 0.01;\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else {\n" +
            "      var dur = Math.log(threshold / velocity) / frictionCoeff;\n" +
            "      if (dur < 0.1) dur = 0.1;\n" +
            "      var pt = t * dur;\n" +
            "      var pos = -(velocity / frictionCoeff) * (1 - Math.exp(frictionCoeff * pt));\n" +
            "      var totalPos = -(velocity / frictionCoeff) * (1 - Math.exp(frictionCoeff * dur));\n" +
            "      val = pos / totalPos;\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildAndroidFling = function (params, selectedKeyIndices) {
        var startVelocity = (params.startVelocity !== undefined) ? params.startVelocity : 2000.0;
        var friction = (params.friction !== undefined) ? params.friction : 1.0;
        var curveCode = this._buildAndroidFlingCode(startVelocity, friction);

        // Calculate fling duration to match curve code's dur
        var velocity = Math.abs(startVelocity);
        var frictionCoeff = friction * -4.2;
        var flingDur = Math.log(0.01 / velocity) / frictionCoeff;
        if (flingDur < 0.1) flingDur = 0.1;

        return this._composeExpression(
            'Android - FlingAnimation',
            'startVelocity=' + startVelocity + ', friction=' + friction,
            curveCode,
            { usePhysicalDuration: true, duration: flingDur },
            selectedKeyIndices
        );
    };
