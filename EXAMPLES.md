# Animation Curves v2 - Practical Examples

This document provides real-world workflows for applying platform-specific motion styles in After Effects.

## Example 1: Rive Elastic Bounce Effect

## Goal

Create a playful elastic overshoot for a UI card scaling in.

## Setup

1. Add a shape or precomp representing the card.
2. Animate `Scale` from `0%` to `100%` with two keyframes.
3. Select the `Scale` property in the timeline.

## Plugin Steps

1. Open `Window > AnimationCurves.jsx`.
2. Go to the `Rive` tab.
3. Select `Elastic`.
4. Start with:
- `amplitude = 1.4`
- `period = 0.35`
- `easingType = Ease Out`
5. Click `Apply to Selected Keyframes`.

## Screenshot Description

- Panel focused on `Rive` tab.
- Curve dropdown shows `Elastic`.
- Parameter panel shows amplitude and period sliders with the values above.
- Timeline shows `Scale` selected with expression enabled.

## Expected Result

The card expands quickly, overshoots, then settles naturally.

## Example 2: Android Material Design Motion

## Goal

Animate a floating action button moving upward with Material-style timing.

## Setup

1. Create a button layer.
2. Add two `Position` keyframes over 18 to 24 frames.
3. Select the animated `Position` property.

## Plugin Steps

1. Open the panel and switch to the `Android` tab.
2. Select `FastOutSlowIn`.
3. No parameters are required.
4. Click `Apply to Selected Keyframes`.

Alternative:
- Use `LinearOutSlowIn` when movement starts immediately and eases into rest.

## Screenshot Description

- `Android` tab selected.
- Curve dropdown set to `FastOutSlowIn`.
- Parameters panel hidden (no adjustable controls).
- Preview box shows `Parameters: none`.

## Expected Result

Motion starts briskly and finishes with a smooth deceleration, matching Material feel.

## Example 3: iOS Spring Animation

## Goal

Create an iOS-style modal pop-in using spring damping and initial velocity.

## Setup

1. Animate modal `Position` from off-screen to center.
2. Add 2 to 3 keyframes over about 0.4 to 0.7 seconds.
3. Select `Position` (and optionally `Opacity`) properties.

## Plugin Steps

1. Open the panel and choose `iOS` tab.
2. Select `Spring Custom`.
3. Start with:
- `damping = 0.78`
- `velocity = 0.20`
- `duration = 0.55`
4. Click `Apply to Selected Keyframes`.
5. Tweak damping:
- Increase damping for less bounce.
- Decrease damping for stronger rebound.

## Screenshot Description

- `iOS` tab active with `Spring Custom` selected.
- Parameter panel displays three sliders (`Damping`, `Velocity`, `Duration`).
- Preview panel lists the selected platform, curve, and parameter values.

## Expected Result

Modal enters with a controlled spring settle that matches common iOS transitions.

## Tips and Best Practices

- Start from presets (`Spring Default`, `Spring Gentle`, `Spring Bouncy`) before custom tuning.
- Adjust one parameter at a time and preview after each apply.
- Keep keyframe spacing consistent before curve tuning.
- Use smaller amplitude/tension values first to avoid exaggerated motion.
- Apply the same curve to related properties (`Position` + `Opacity`) for cohesive motion language.
- If motion feels unstable, reset to default parameter values and iterate from there.

