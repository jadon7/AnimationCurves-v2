# Animation Curves v2 for After Effects

Animation Curves v2 is a single-file ExtendScript plugin for Adobe After Effects that applies cross-platform timing curves directly to selected keyframed properties.

It includes **26 curves from 3 platforms**:
- **Rive**: 1 elastic curve
- **Android**: 11 interpolators
- **iOS**: 14 easing/spring/Core Animation curves

## Features

- Single-file script (`AnimationCurves.jsx`), no external dependencies
- Platform tabs: **Rive**, **Android**, **iOS**
- 26 production-ready curves with parameter controls where applicable
- Real-time curve preview text (platform, curve, parameters)
- One-click apply to selected keyframed properties
- Batch apply to multiple properties in one operation
- Built-in validation and user-facing error messages

## System Requirements

- Adobe After Effects **CC 2015 or later**
- macOS or Windows environment supported by your AE version

## Installation

1. Locate your After Effects Scripts UI Panels folder:
- macOS: `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`
- Windows: `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`
2. Copy `AnimationCurves.jsx` into that folder.
3. Start or restart After Effects.
4. Open from `Window > AnimationCurves.jsx`.

## Quick Start

1. Open a composition with keyframed properties.
2. Select one or more properties in the timeline.
3. Open `Window > AnimationCurves.jsx`.
4. Choose a tab: **Rive**, **Android**, or **iOS**.
5. Select a curve and adjust parameters (if shown).
6. Click **Apply to Selected Keyframes**.
7. Preview animation and iterate parameters as needed.

## Curve Library (26 Total)

### Rive (1)
- Elastic

### Android (11)
- Linear
- Accelerate
- Decelerate
- AccelerateDecelerate
- Anticipate
- Overshoot
- AnticipateOvershoot
- Bounce
- FastOutSlowIn
- FastOutLinearIn
- LinearOutSlowIn

### iOS (14)
- Linear
- Default
- EaseIn
- EaseOut
- EaseInOut
- Spring Default
- Spring Gentle
- Spring Bouncy
- Spring Custom
- CA Default
- CA EaseIn
- CA EaseOut
- CA EaseInEaseOut
- CA Linear

## Documentation

- User guide: `USER_GUIDE.md`
- Practical examples: `EXAMPLES.md`

