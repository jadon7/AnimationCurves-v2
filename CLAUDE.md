# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AnimationCurves v2 is a single-file Adobe After Effects plugin (ExtendScript) that applies physics-based animation timing curves to keyframed properties. It enables motion designers to use realistic platform-specific easing curves (Rive, iOS) directly in After Effects.

**Current version: v2.1** - Focused on 5 physics-based curves only (1 Rive Elastic + 4 iOS Spring variants).

## System Requirements

- Adobe After Effects CC 2015 or later
- ExtendScript (JavaScript 1.5) - NO ES6+ syntax
- ScriptUI for UI components

## Installation & Testing

### Install Plugin
```bash
# macOS
cp AnimationCurves.jsx "/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/"

# Windows
cp AnimationCurves.jsx "C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\"
```

### Run Plugin
1. Start/restart After Effects
2. Open from `Window > AnimationCurves.jsx`

### Run Tests
1. Open After Effects
2. Open ExtendScript Toolkit or JavaScript Console
3. Run `dev/testing/tests/unit/curve-tests.jsx`
4. Check console for PASS/FAIL/SKIP results

## Code Architecture

### Single-File Structure (AnimationCurves.jsx)

The plugin is organized into logical parts within one file:

**Part 1: Curve Mathematics** (~lines 1-150)
- `RiveElasticCurve` - Damped sinusoidal oscillation
- `IOSSpringCurve` - Damped harmonic oscillator base
- `IOSSpringDefaultCurve`, `IOSSpringGentleCurve`, `IOSSpringBouncyCurve`, `IOSSpringCustomCurve` - Spring variants
- Each curve has `getValue(t)` method: input t ∈ [0,1] → output value

**Part 2: Expression Generator** (~lines 150-450)
- Generates After Effects expression code as strings
- Two timing models:
  - **Time-driven** (Rive Elastic): Uses keyframe time distance `(outPoint - inPoint)`
  - **Physics-driven** (iOS Spring): Uses fixed `duration` parameter
- Critical: Uses `valueAtTime()` not `value.at()` (AE doesn't support it)
- Uses `linear()` to map curve values to actual keyframe values

**Part 3: Data Model** (~lines 450-600)
- Stores current platform, curve type, and parameters
- Methods: `setPlatform()`, `setCurveType()`, `setParam()`, `getParams()`

**Part 4: UI Components** (~lines 600-1100)
- ScriptUI-based interface with tabs (Rive / iOS)
- Dynamic parameter controls (sliders + input fields)
- Real-time curve preview using ScriptUI Graphics (280x110px canvas)
- Apply button for batch operations

**Part 5: Main Entry Point** (~line 1100+)
- Initializes model, creates UI, shows window

### Key Technical Constraints

**ExtendScript Limitations:**
- JavaScript 1.5 only - NO arrow functions, let/const, template strings, spread operators
- Must use `var` and `function` keyword
- No modern array methods (map, filter, reduce)

**ScriptUI Layout Refresh:**
After changing `element.visible`, you MUST refresh layout:
```javascript
element.layout.layout(true);
element.layout.resize();
element.parent.layout.layout(true);
```

**After Effects Expression Syntax:**
```javascript
// ✅ Correct
valueAtTime(time)
linear(t, tMin, tMax, v1, v2)

// ❌ Wrong
value.at(time)  // Does not exist
```

## Curve Implementation Details

### Time Handling (Critical)

**Rive Elastic (Time-driven):**
```javascript
var duration = outPoint - inPoint;  // Use keyframe distance
var t = (time - inPoint) / duration;
```

**iOS Spring (Physics-driven):**
```javascript
var duration = 1.0;  // Fixed physical time from parameter
var t = (time - inPoint) / duration;
```

This distinction is essential - Spring curves need fixed duration for correct physics behavior.

### Curve Parameters

**Rive Elastic:**
- `amplitude` (1.0-3.0): Oscillation amplitude
- `period` (0.1-1.0): Oscillation period
- `easingType`: "easeIn" | "easeOut" | "easeInOut"

**iOS Spring (all variants):**
- `damping` (0.1-1.0): Higher = less bounce (Default: 0.8, Gentle: 0.9, Bouncy: 0.5)
- `velocity` (0.0-3.0): Initial velocity
- `duration` (0.1-2.0): Physical animation duration in seconds

## Development Workflow

### Modifying Curves

1. Locate curve class in Part 1 (Curve Mathematics)
2. Modify `getValue(t)` method
3. Update expression generator in Part 2 if parameters changed
4. Test in After Effects with real keyframes
5. Run unit tests in `dev/testing/tests/unit/curve-tests.jsx`

### Adding New Curves

1. Create curve class with `getValue(t)` method in Part 1
2. Add expression generation logic in Part 2
3. Update UI to include new curve in dropdown
4. Add parameter controls if needed
5. Update documentation (README.md, USER_GUIDE.md)

### UI Changes

1. Locate UI component creation in Part 4
2. Modify ScriptUI elements
3. **Always call layout refresh** after visibility changes
4. Test parameter synchronization (slider ↔ input field)
5. Verify preview canvas updates correctly

### Expression Generation

When modifying expression generators:
- Keep expressions as strings
- Use ExtendScript-compatible syntax only
- Test in AE expression editor for syntax errors
- Ensure `valueAtTime()` and `linear()` usage is correct
- Add comments in generated expressions for debugging

## Common Pitfalls

1. **Forgetting layout refresh** - UI won't update after `visible` changes
2. **Using ES6 syntax** - ExtendScript will fail silently or throw errors
3. **Wrong time model** - Spring curves need fixed duration, not keyframe distance
4. **Expression syntax errors** - Test in AE before committing
5. **Missing parameter validation** - Always validate user input ranges

## Documentation Files

- `README.md` - Quick start and installation
- `USER_GUIDE.md` - Detailed usage instructions
- `EXAMPLES.md` - Practical workflow examples
- `PRODUCT_REQUIREMENTS.md` - Original PRD (26 curves planned, now 5 implemented)
- `CHANGELOG.md` - Version history and technical changes
- `dev/testing/tests/TESTING_GUIDE.md` - Testing framework documentation

## Project History

- **Original plan**: 26 curves across 3 platforms (Rive, Android, iOS)
- **v2.1 refocus**: Simplified to 5 physics-based curves only
- **Recent fixes**: Spring curve time handling, visual preview, slider synchronization
- **Code reduction**: 1600 → 1109 lines (-491 lines)

## Git Workflow

Current branch: `main`

When committing changes:
- Follow existing commit message style (see `git log`)
- Prefix with "fix:", "feat:", "refactor:", etc.
- Keep commits focused and atomic
- Update CHANGELOG.md for significant changes
