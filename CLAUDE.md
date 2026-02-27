# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AnimationCurves v2 is an Adobe After Effects CEP Extension that applies physics-based animation timing curves to keyframed properties. Dockable panel with modern HTML/CSS/JS UI.

**Current state:** 7 physics-based curves across 4 platforms (Rive, Folme, Android, iOS).

## Critical Constraints

**ExtendScript = JavaScript 1.5 only (host/ files):**
- NO `let`, `const`, arrow functions, template literals, spread operators, destructuring
- NO `Array.map()`, `Array.filter()`, `Array.reduce()`, `Array.forEach()`
- Use `var`, `function`, and `for` loops exclusively
- ExtendScript fails silently or throws cryptic errors on ES6+ syntax
- No `Math.cosh`/`Math.sinh` — expand manually: `(e^x + e^-x)/2`, `(e^x - e^-x)/2`

**client/ files use modern JavaScript (ES6+)** — runs in CEF/Chromium, not ExtendScript.

**After Effects expression syntax:**
- Use `valueAtTime(time)` — NOT `value.at(time)` (does not exist)
- Use `linear(t, tMin, tMax, v1, v2)` for interpolation
- `canSetExpression` is a property, not a method — no parentheses

## Architecture

```
├── CSXS/manifest.xml              # CEP 11.0 extension manifest
├── client/                         # Front-end (HTML/CSS/JS, ES6+)
│   ├── index.html
│   ├── styles.css
│   ├── main.js                    # UI logic, canvas preview, parameter controls
│   ├── curves.js                  # Curve math classes (ES6, for preview)
│   └── lib/CSInterface.js         # Adobe CEP bridge library
├── host/                           # Back-end (ExtendScript, JS 1.5 only)
│   ├── index.jsx                  # Main host script
│   └── expression-generator.jsx   # Curve classes + AE expression generator
├── install-dev.sh                 # Dev installation script
└── .debug                         # CEP debug config
```

Communication: client ↔ host via CSInterface bridge.

## Curve Library (7 Curves)

| Platform | Curve | Key Parameters |
|----------|-------|---------------|
| Rive | Elastic | amplitude, period, easingType |
| Folme | Spring | damping, response |
| Android | Spring | stiffness, dampingRatio |
| Android | Fling | startVelocity, friction |
| iOS | Duration + Bounce | duration, bounce |
| iOS | Response + Damping | response, dampingFraction |
| iOS | Physics | mass, stiffness, damping |

## Time Models (Critical)

**Time-driven** (Rive Elastic):
```javascript
var duration = outPoint - inPoint;  // Uses keyframe distance
var t = (time - inPoint) / duration;
```

**Physics-driven** (all spring/fling curves):
Expression `duration` MUST equal the curve's calculated settling time so that `tau = t * settlingTime` maps to real physics time. Mismatched duration causes incorrect animation speed.

## Development Workflow

### Modifying Curves
1. Edit curve class in `client/curves.js` (ES6, for preview)
2. Edit matching curve class in `host/expression-generator.jsx` (ExtendScript)
3. Update expression builder code in the same file
4. Ensure expression `duration` config matches the curve's settling time
5. Test in After Effects with real keyframes

### Adding New Curves
1. Add curve class in `client/curves.js`
2. Add curve class + expression builder in `host/expression-generator.jsx`
3. Register in CurveFactory (`client/curves.js`)
4. Add UI controls in `client/main.js`

## Build & Dependencies

- No build system, no package.json, no npm
- Pure JavaScript — zero external dependencies
- Requires Adobe's CSInterface.js (download separately)

## Git Workflow

- Branch: `feat/add-curves-and-ui-improvements` (current)
- Main branch: `main`
- Commit prefix: `fix:`, `feat:`, `refactor:`, `docs:`

## Common Pitfalls

1. **ES6 in host/** — ExtendScript will fail silently or throw errors
2. **Expression duration mismatch** — Must equal curve's settling time for correct physics speed
3. **`canSetExpression`** — It's a property, not a method (no parentheses)
4. **No Math.cosh/sinh in ExtendScript** — Must expand manually
5. **Expression syntax** — Always test generated expressions in AE expression editor
