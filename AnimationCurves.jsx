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

    // Part 2: Expression Generator
    function ExpressionGenerator() {
        this.templates = {
            rive: {
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

    ExpressionGenerator.prototype._composeExpression = function (title, paramsLine, curveCode, timingConfig) {
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
            "\n" +
            "    // Calculate segment duration and progress t (0 to 1)\n";

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
            "    startVal + (endVal - startVal) * val;\n" +
            "  }\n" +
            "}\n";

        return "// " + title + "\n" +
            "// Parameters: " + paramsLine + "\n" +
            keyframeLogic;
    };

    ExpressionGenerator.prototype._buildRiveElastic = function (params) {
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
            curveCode
        );
    };

    ExpressionGenerator.prototype._buildIOSSpringCode = function (damping, velocity, duration) {
        return "    var damping = " + damping + ";\n" +
            "    var velocity = " + velocity + ";\n" +
            "    var springDuration = " + duration + ";\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else {\n" +
            "      var tau = t * springDuration;\n" +
            "      var omega = 12 / Math.max(springDuration, 0.0001);\n" +
            "      var envelope = Math.exp(-damping * 8 * tau);\n" +
            "      val = 1 - envelope * (Math.cos(omega * tau) + (velocity / Math.max(omega, 0.0001)) * Math.sin(omega * tau));\n" +
            "    }\n";
    };

    ExpressionGenerator.prototype._buildIOSSpringDefault = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.8;
        var velocity = (params.velocity !== undefined) ? params.velocity : 0.0;
        var duration = (params.duration !== undefined) ? params.duration : 1.0;
        var curveCode = this._buildIOSSpringCode(damping, velocity, duration);

        return this._composeExpression(
            'iOS - Spring Default',
            'damping=' + damping + ', velocity=' + velocity + ', duration=' + duration,
            curveCode,
            { usePhysicalDuration: true, duration: duration }
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
            curveCode,
            { usePhysicalDuration: true, duration: duration }
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
            curveCode,
            { usePhysicalDuration: true, duration: duration }
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
            curveCode,
            { usePhysicalDuration: true, duration: duration }
        );
    };

    ExpressionGenerator.prototype._buildFolmeSpringCode = function (damping, response, duration) {
        return "    var damping = " + damping + ";\n" +
            "    var response = " + response + ";\n" +
            "    var springDuration = " + duration + ";\n" +
            "    if (t === 0) {\n" +
            "      val = 0;\n" +
            "    } else if (t === 1) {\n" +
            "      val = 1;\n" +
            "    } else {\n" +
            "      var mass = 1;\n" +
            "      var tension = Math.pow(2 * Math.PI / response, 2) * mass;\n" +
            "      var dampingCoeff = 4 * Math.PI * damping * mass / response;\n" +
            "      dampingCoeff = Math.min(dampingCoeff, 60);\n" +
            "      var physicsTime = t * springDuration;\n" +
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

    ExpressionGenerator.prototype._buildFolmeSpring = function (params) {
        var damping = (params.damping !== undefined) ? params.damping : 0.9;
        var response = (params.response !== undefined) ? params.response : 0.3;
        var duration = (params.duration !== undefined) ? params.duration : 0.5;
        var curveCode = this._buildFolmeSpringCode(damping, response, duration);

        return this._composeExpression(
            'Folme - Spring',
            'damping=' + damping + ', response=' + response + ', duration=' + duration,
            curveCode,
            { usePhysicalDuration: true, duration: duration }
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

    ExpressionGenerator.prototype._buildAndroidSpring = function (params) {
        var tension = (params.tension !== undefined) ? params.tension : 160.0;
        var friction = (params.friction !== undefined) ? params.friction : 18.0;
        var curveCode = this._buildAndroidSpringCode(tension, friction);

        return this._composeExpression(
            'Android - SpringInterpolator',
            'tension=' + tension + ', friction=' + friction,
            curveCode
        );
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

        if (p === 'ios') {
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
            throw new Error('Unsupported iOS curve: ' + type);
        }

        if (p === 'folme') {
            if (t === 'spring') {
                return new FolmeSpringCurve(
                    ensureNumber(cfg.damping, 'damping', 0.9),
                    ensurePositiveNumber(cfg.response, 'response', 0.3),
                    ensurePositiveNumber(cfg.duration, 'duration', 0.5)
                );
            }
            throw new Error('Unsupported Folme curve: ' + type);
        }

        if (p === 'android') {
            if (t === 'spring') {
                return new AndroidSpringCurve(
                    ensurePositiveNumber(cfg.tension, 'tension', 160.0),
                    ensureNonNegativeNumber(cfg.friction, 'friction', 18.0)
                );
            }
            throw new Error('Unsupported Android curve: ' + type);
        }

        throw new Error('Unsupported platform: ' + platform);
    };

    // Part 6: UI Components
    var PLATFORM_DATA = {
        // Physics-based preset list (6 total): Rive Elastic + iOS Spring variants + Android Spring.
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
        iOS: {
            curves: [
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
                }
            ]
        },
        Folme: {
            curves: [
                {
                    name: 'Spring',
                    params: [
                        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.9 },
                        { key: 'response', label: 'Response', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.3 },
                        { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.5 }
                    ]
                }
            ]
        },
        Android: {
            curves: [
                {
                    name: 'Spring',
                    params: [
                        { key: 'tension', label: 'Tension', type: 'slider', min: 10.0, max: 300.0, step: 1.0, defaultValue: 160.0 },
                        { key: 'friction', label: 'Friction', type: 'slider', min: 0.0, max: 80.0, step: 0.1, defaultValue: 18.0 }
                    ]
                }
            ]
        }
    };

    function createUI(viewModel) {
        var win = new Window('palette', 'Animation Curves v2.0', undefined, { resizeable: false });
        win.orientation = 'column';
        win.alignChildren = ['fill', 'top'];
        win.spacing = 8;
        win.margins = 10;
        win.preferredSize = [330, 650];

        var tabs = win.add('tabbedpanel');
        tabs.alignChildren = ['fill', 'top'];
        tabs.preferredSize = [310, 490];

        var riveTab = tabs.add('tab', undefined, 'Rive');
        var iosTab = tabs.add('tab', undefined, 'iOS');
        var folmeTab = tabs.add('tab', undefined, 'Folme');
        var androidTab = tabs.add('tab', undefined, 'Android');

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

        function createPreviewCurve() {
            var curveDef = getSelectedCurveDef(currentPlatform);
            var paramsObj;
            if (!curveDef) {
                return null;
            }
            paramsObj = viewModel.getParams();
            return viewModel.curveFactory.createCurve(currentPlatform, curveDef.name, paramsObj);
        }

        function updatePreview() {
            var curveDef = getSelectedCurveDef(currentPlatform);
            var curve = null;

            try {
                curve = createPreviewCurve();
            } catch (err) {
                // Silently handle errors
            }

            previewCanvas.previewCurve = curve;
            previewCanvas.hide();
            previewCanvas.show();
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
                            applyToKeyframesHelper();
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
                            applyToKeyframesHelper();
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
                            applyToKeyframesHelper();
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
                    applyToKeyframesHelper();
                }
            };

            uiByPlatform[platformName] = {
                dropdown: curveDropdown,
                paramsPanel: paramsPanel,
                paramControls: []
            };
        }

        buildTabContent(riveTab, 'Rive');
        buildTabContent(iosTab, 'iOS');
        buildTabContent(folmeTab, 'Folme');
        buildTabContent(androidTab, 'Android');

        var previewPanel = win.add('panel');
        previewPanel.alignChildren = ['fill', 'top'];
        previewPanel.preferredSize = [310, 120];

        var previewCanvas = previewPanel.add('panel');
        previewCanvas.preferredSize = [310, 110];
        previewCanvas.alignment = ['center', 'top'];
        previewCanvas.previewCurve = null;

        previewCanvas.onDraw = function () {
            var g = this.graphics;
            var bounds = this.bounds;
            var width = bounds.width;
            var height = bounds.height;
            var margin = 10;
            var graphLeft = margin;
            var graphTop = margin;
            var graphWidth = width - margin * 2;
            var graphHeight = height - margin * 2;
            var x;
            var y;
            var i;
            var t;
            var sampleCount = 120;
            var curve = this.previewCurve;
            var value;
            var curveX;
            var curveY;
            var minValue = 0;
            var maxValue = 1;
            var valueRange;
            var samples = [];

            var gridPen = g.newPen(g.PenType.SOLID_COLOR, [0.3, 0.3, 0.3, 1], 1);
            var curvePen = g.newPen(g.PenType.SOLID_COLOR, [0.3, 0.6, 1.0, 1], 2);
            var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.15, 0.15, 0.15, 1]);

            g.newPath();
            g.rectPath(0, 0, width, height);
            g.fillPath(bgBrush);

            // If curve exists, sample all values to find min/max
            if (curve) {
                for (i = 0; i <= sampleCount; i += 1) {
                    t = i / sampleCount;
                    value = curve.getValue(t);
                    samples.push(value);
                    if (value < minValue) {
                        minValue = value;
                    }
                    if (value > maxValue) {
                        maxValue = value;
                    }
                }

                // Add padding to the range
                valueRange = maxValue - minValue;
                if (valueRange < 0.1) {
                    valueRange = 0.1;
                }
                minValue = minValue - valueRange * 0.1;
                maxValue = maxValue + valueRange * 0.1;
            }

            valueRange = maxValue - minValue;

            // Draw grid
            for (i = 0; i <= 10; i += 1) {
                x = graphLeft + (i / 10) * graphWidth;
                y = graphTop + (i / 10) * graphHeight;

                g.newPath();
                g.moveTo(x, graphTop);
                g.lineTo(x, graphTop + graphHeight);
                g.strokePath(gridPen);

                g.newPath();
                g.moveTo(graphLeft, y);
                g.lineTo(graphLeft + graphWidth, y);
                g.strokePath(gridPen);
            }

            if (!curve) {
                return;
            }

            // Draw curve using pre-sampled values
            g.newPath();
            for (i = 0; i <= sampleCount; i += 1) {
                t = i / sampleCount;
                value = samples[i];
                curveX = graphLeft + t * graphWidth;
                curveY = graphTop + (1 - (value - minValue) / valueRange) * graphHeight;

                if (i === 0) {
                    g.moveTo(curveX, curveY);
                } else {
                    g.lineTo(curveX, curveY);
                }
            }
            g.strokePath(curvePen);
        };

        function applyToKeyframesHelper() {
            var activePlatform = currentPlatform;
            var ui = uiByPlatform[activePlatform];

            // Check if a curve is selected
            if (!ui || !ui.dropdown.selection || ui.dropdown.selection.index === 0) {
                return;
            }

            // Get the selected curve definition
            var curveDef = getSelectedCurveDef(activePlatform);
            if (!curveDef) {
                return;
            }

            // Update viewModel with current tab's platform and curve
            viewModel.setPlatform(activePlatform);
            viewModel.setCurveType(curveDef.name);

            // Apply to keyframes
            applyToKeyframes(viewModel);
        }

        tabs.selection = riveTab;

        tabs.onChange = function () {
            if (!tabs.selection) {
                return;
            }
            currentPlatform = tabs.selection.text;
            updatePreview();
            applyToKeyframesHelper();
            refreshLayout();
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
            return;
        }

        comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return;
        }

        selectedProps = comp.selectedProperties;
        if (!selectedProps || selectedProps.length === 0) {
            return;
        }

        try {
            expression = viewModel.generateExpression();
        } catch (generateErr) {
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

        // Silent operation - no alerts for auto-apply
    }

    // Part 8: Main entry point
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

    function ensureNonNegativeNumber(value, name, fallback) {
        var v = ensureNumber(value, name, fallback);
        if (v < 0) {
            throw new Error('Invalid parameter "' + name + '": must be greater than or equal to 0.');
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
