# Animation Curves v2 - User Guide

## 1. Overview

Animation Curves v2 is an After Effects ScriptUI panel that applies interpolation curves to selected keyframed properties using generated expressions. The current library includes 5 physics-based curves:
- Rive
- iOS

## 2. Install the Plugin

1. Close After Effects.
2. Copy `AnimationCurves.jsx` to your ScriptUI Panels folder.
- macOS: `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`
- Windows: `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`
3. Launch After Effects.
4. Open the panel from `Window > AnimationCurves.jsx`.

## 3. Interface Walkthrough

## Tabs

- **Rive** tab: Rive-style elastic easing.
- **iOS** tab: Spring presets and custom spring controls.

## Shared Controls

- **Curve dropdown**: Selects the active curve for the current tab.
- **Parameters panel**: Appears only when the selected curve has editable parameters.
- **Curve Preview**: Shows platform, curve name, and current parameter values.
- **Apply to Selected Keyframes**: Applies generated expression to all valid selected properties.

## 4. How to Use Each Tab

1. Select the target tab (`Rive` or `iOS`).
2. Pick a curve from the dropdown.
3. Adjust parameters with sliders/input fields (if available).
4. Verify values in the preview panel.
5. Click `Apply to Selected Keyframes`.

## 5. Curve and Parameter Reference

## Rive

- **Elastic**
- `amplitude` (1.0 to 3.0): Controls overshoot strength.
- `period` (0.1 to 2.0): Controls oscillation frequency.
- `easingType` (`Ease Out`, `Ease In`, `Ease In-Out`): Controls entry/exit behavior.

## iOS

- **Spring Default**
- `damping` (0.1 to 1.0): Higher value reduces bounce.
- `velocity` (0.0 to 3.0): Initial speed at animation start.
- `duration` (0.1 to 2.0): Effective spring duration in seconds.
- **Spring Gentle**
- `damping` (0.1 to 1.0), `velocity` (0.0 to 3.0), `duration` (0.1 to 2.0): Softer spring preset.
- **Spring Bouncy**
- `damping` (0.1 to 1.0), `velocity` (0.0 to 3.0), `duration` (0.1 to 2.0): More pronounced bounce preset.
- **Spring Custom**
- `damping` (0.1 to 1.0), `velocity` (0.0 to 3.0), `duration` (0.1 to 2.0): Fully tunable spring behavior.

## 6. Apply Curves to Keyframes

1. Open an active composition.
2. Select at least one property that already has keyframes.
3. Choose platform/curve/parameters in the panel.
4. Click `Apply to Selected Keyframes`.
5. The script applies expressions to each valid selected property.

Notes:
- Properties without keyframes are skipped.
- Properties that do not support expressions are skipped.
- A summary dialog reports applied, skipped, and failed items.

## 7. Troubleshooting

## Panel does not appear in Window menu

- Confirm `AnimationCurves.jsx` is inside `Scripts/ScriptUI Panels/`.
- Restart After Effects after copying the file.

## Alert: no active composition

- Open/select a composition panel before applying curves.

## Alert: no selected animated property

- Select timeline properties, not layers only.
- Ensure selected properties contain at least one keyframe.

## Expression errors on apply

- Confirm property supports expressions (`Position`, `Scale`, `Rotation`, `Opacity`, etc.).
- Remove conflicting expressions and re-apply.
- Check for protected/locked contexts in templates.

## Unexpected motion results

- Reset parameters to defaults and retest.
- Use smaller values first for spring and elastic curves.
- Verify keyframe timing and value spacing in timeline.

## 8. Compatibility

- Adobe After Effects CC 2015+
- Tested target range from project requirements: CC 2015 through CC 2024
