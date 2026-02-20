/*
 * AnimationCurves Phase 1 Test Framework
 * ExtendScript (ES3) - runnable in Adobe After Effects
 */

(function () {
    var StandardTDataGenerator = {
        create: function () {
            return [0, 0.25, 0.5, 0.75, 1.0];
        }
    };

    var CurveTestFramework = {
        curves: [],
        results: {
            passed: 0,
            failed: 0,
            skipped: 0
        },

        registerCurve: function (platform, name, evaluator) {
            this.curves.push({
                platform: platform,
                name: name,
                evaluator: evaluator
            });
        },

        bindEvaluator: function (platform, name, evaluator) {
            var i;
            for (i = 0; i < this.curves.length; i++) {
                if (this.curves[i].platform === platform && this.curves[i].name === name) {
                    this.curves[i].evaluator = evaluator;
                    return true;
                }
            }
            return false;
        },

        log: function (message) {
            $.writeln(message);
        },

        formatNumber: function (value) {
            if (typeof value !== "number") {
                return String(value);
            }
            return String(Math.round(value * 1000000) / 1000000);
        },

        runCurve: function (curve, tValues) {
            var i;
            var value;

            this.log("[" + curve.platform + "] " + curve.name);

            if (typeof curve.evaluator !== "function") {
                this.results.skipped += 1;
                this.log("  SKIP: evaluator not bound yet");
                this.log("  ---");
                return;
            }

            try {
                for (i = 0; i < tValues.length; i++) {
                    value = curve.evaluator(tValues[i]);
                    if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
                        throw new Error("invalid output at t=" + tValues[i] + ": " + value);
                    }
                    this.log("  t=" + tValues[i] + " -> " + this.formatNumber(value));
                }

                this.results.passed += 1;
                this.log("  PASS");
            } catch (err) {
                this.results.failed += 1;
                this.log("  FAIL: " + err.toString());
            }

            this.log("  ---");
        },

        runAll: function () {
            var tValues = StandardTDataGenerator.create();
            var i;

            this.log("========================================");
            this.log("AnimationCurves Test Framework - Phase 1");
            this.log("Standard t values: [" + tValues.join(", ") + "]");
            this.log("========================================");

            for (i = 0; i < this.curves.length; i++) {
                this.runCurve(this.curves[i], tValues);
            }

            this.log("========================================");
            this.log("Summary");
            this.log("  Passed : " + this.results.passed);
            this.log("  Failed : " + this.results.failed);
            this.log("  Skipped: " + this.results.skipped);
            this.log("  Total  : " + this.curves.length);
            this.log("========================================");
        }
    };

    function registerExpectedCurves(framework) {
        var rive = ["Elastic"];
        var android = [
            "Linear",
            "Accelerate",
            "Decelerate",
            "AccelerateDecelerate",
            "Anticipate",
            "Overshoot",
            "AnticipateOvershoot",
            "Bounce",
            "FastOutSlowIn",
            "FastOutLinearIn",
            "LinearOutSlowIn"
        ];
        var ios = [
            "Linear",
            "EaseIn",
            "EaseOut",
            "EaseInOut",
            "Spring Default",
            "Spring Gentle",
            "Spring Bouncy",
            "Spring Custom",
            "CA Default",
            "CA EaseIn",
            "CA EaseOut",
            "CA EaseInEaseOut",
            "CA Linear"
        ];
        var i;

        for (i = 0; i < rive.length; i++) {
            framework.registerCurve("Rive", rive[i], null);
        }
        for (i = 0; i < android.length; i++) {
            framework.registerCurve("Android", android[i], null);
        }
        for (i = 0; i < ios.length; i++) {
            framework.registerCurve("iOS", ios[i], null);
        }
    }

    function bindSampleEvaluators(framework) {
        framework.bindEvaluator("Rive", "Elastic", function (t) {
            return t;
        });

        framework.bindEvaluator("Android", "Linear", function (t) {
            return t;
        });

        framework.bindEvaluator("iOS", "Linear", function (t) {
            return t;
        });
    }

    registerExpectedCurves(CurveTestFramework);

    // Phase 1 bootstrap: replace sample evaluators with real curve implementations.
    bindSampleEvaluators(CurveTestFramework);

    CurveTestFramework.runAll();
}());
