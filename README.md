# Animation Curves v2 for After Effects

Animation Curves v2 is a single-file ExtendScript plugin for Adobe After Effects that applies physics-based timing curves directly to selected keyframed properties.

It includes **5 curves from 2 platforms**:
- **Rive**: 1 elastic curve
- **iOS**: 4 spring curves

## Features

- Single-file script (`AnimationCurves.jsx`), no external dependencies
- Platform tabs: **Rive**, **iOS**
- 5 production-ready physics curves with parameter controls
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
4. Choose a tab: **Rive** or **iOS**.
5. Select a curve and adjust parameters (if shown).
6. Click **Apply to Selected Keyframes**.
7. Preview animation and iterate parameters as needed.

## Curve Library (5 Total)

### Rive (1)
- Elastic

### iOS (4)
- Spring Default
- Spring Gentle
- Spring Bouncy
- Spring Custom

## Documentation

- User guide: `USER_GUIDE.md`
- Practical examples: `EXAMPLES.md`
