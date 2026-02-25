# Animation Curves v2 for After Effects

Animation Curves v2 is a single-file ExtendScript plugin for Adobe After Effects that applies physics-based timing curves directly to selected keyframed properties.

It includes **7 curves from 4 platforms**:
- **Rive**: 1 elastic curve
- **Folme**: 1 spring curve
- **Android**: 1 spring curve
- **iOS**: 4 spring curves

## Features

- Single-file script (`AnimationCurves.jsx`), no external dependencies
- Platform tabs: **Rive**, **Folme**, **Android**, **iOS**
- 7 production-ready physics curves with parameter controls
- Real-time curve preview with dark theme (280x110px canvas)
- Auto-apply on parameter changes with live preview
- Selective keyframe segment application (only applies to selected keyframes)
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
2. Select one or more keyframes in the timeline (not just properties).
3. Open `Window > AnimationCurves.jsx`.
4. Choose a tab: **Rive**, **Folme**, **Android**, or **iOS**.
5. Select a curve and adjust parameters using sliders.
6. Curves auto-apply on parameter changes - watch the preview update in real-time.
7. Preview animation and iterate parameters as needed.

## Curve Library (7 Total)

### Rive (1)
- Elastic (Amplitude: 1.0, Period: 1.0, Easing: Ease Out)

### Folme (1)
- Spring (Damping: 0.95, Response: 0.35)

### Android (1)
- Spring (Tension: 160, Friction: 18)

### iOS (4)
- Spring Default (Damping: 0.8, Velocity: 0.0)
- Spring Gentle (Damping: 0.9, Velocity: 0.0)
- Spring Bouncy (Damping: 0.5, Velocity: 0.2)
- Spring Custom (Damping: 0.7, Velocity: 0.0)

## Documentation

- User guide: `USER_GUIDE.md`
- Practical examples: `EXAMPLES.md`
