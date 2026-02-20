# AnimationCurves Testing Guide (Phase 1)

## Scope

Phase 1 provides a lightweight ExtendScript test harness for curve output sampling.

- Runtime: Adobe After Effects (File > Scripts > Run Script File...)
- Test points: `t = [0, 0.25, 0.5, 0.75, 1.0]`
- Output: readable text logs in ExtendScript Console

## Files

- `tests/unit/curve-tests.jsx`: test runner and curve registry

## Run In After Effects

1. Open After Effects.
2. Open ExtendScript Toolkit / JavaScript Console (or use VS Code ExtendScript debugger).
3. Run `tests/unit/curve-tests.jsx`.
4. Read the output log:
   - `PASS`: evaluator returns valid numeric values for all standard `t`
   - `FAIL`: evaluator throws or returns invalid value
   - `SKIP`: curve exists in registry but evaluator not bound yet

## Framework Structure

`curve-tests.jsx` includes:

- `StandardTDataGenerator.create()`: returns standard sample times.
- `registerExpectedCurves(...)`: registers all PRD curve names for Rive / Android / iOS.
- `bindEvaluator(platform, name, evaluator)`: attaches real curve function.
- `runAll()`: executes all curve tests and prints summary.

## Connect Real Curve Implementations

Replace sample bindings in `bindSampleEvaluators(...)` with real math evaluators.

Example:

```javascript
framework.bindEvaluator("Android", "Accelerate", function (t) {
    var factor = 1.0;
    return Math.pow(t, 2 * factor);
});
```

## Notes

- Use ExtendScript-compatible syntax only (ES3): `var`, `function`, no arrow functions.
- Keep curve evaluators pure: input `t` in `[0..1]`, output a number.
- Some curves may overshoot (`>1` or `<0`) by design, so Phase 1 only checks numeric validity.
