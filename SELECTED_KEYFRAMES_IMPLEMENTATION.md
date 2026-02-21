# Selected Keyframe Segments Implementation

## Overview
The AnimationCurves.jsx script has been updated to apply animation curves only to selected keyframe segments, rather than all segments in a property.

## Changes Made

### 1. ExpressionGenerator.prototype.generate (Line 237)
**Added parameter:** `selectedKeyIndices`
- Now accepts an array of selected keyframe indices (1-based, matching AE's keyframe indexing)
- Passes this parameter to all curve builder methods

### 2. ExpressionGenerator.prototype._composeExpression (Line 255)
**Added parameter:** `selectedKeyIndices`
**New logic:**
- When `selectedKeyIndices` is provided and has elements:
  - Generates a `useCurve` boolean check in the expression
  - Creates an `if` condition checking if current segment index `n` matches any selected keyframe
  - Wraps the curve calculation code inside `if (useCurve) { ... }`
  - Adds an `else` clause that returns `value` (linear interpolation) for non-selected segments

**Generated expression structure:**
```javascript
if (n === 2 || n === 5 || n === 7) {
  useCurve = true;
}

if (useCurve) {
  // Apply curve calculation
  // ... curve code ...
} else {
  // Use linear interpolation for non-selected segments
  value;
}
```

### 3. All Curve Builder Methods
Updated to accept and pass through `selectedKeyIndices`:
- `_buildRiveElastic` (Line 343)
- `_buildIOSSpringDefault` (Line 392)
- `_buildIOSSpringGentle` (Line 406)
- `_buildIOSSpringBouncy` (Line 420)
- `_buildIOSSpringCustom` (Line 434)
- `_buildFolmeSpring` (Line 478)
- `_buildAndroidSpring` (Line 516)

### 4. ViewModel.prototype.generateExpression (Line 621)
**Added parameter:** `selectedKeyIndices`
- Passes selected keyframe indices to the expression generator

### 5. applyToKeyframes Function (Line 1280)
**Major changes:**
- Retrieves selected keyframes for each property using `prop.selectedKeys`
- Builds an array of selected keyframe indices
- If no keyframes are selected for a property, skips that property with message: "no keyframes selected"
- Passes selected keyframe indices to `viewModel.generateExpression()`
- Generates a unique expression for each property based on its selected keyframes

## Behavior

### Before
- Expression applied to ALL keyframe segments in a property
- Used `nearestKey()` to determine current segment
- Applied curve to every segment between keyframes

### After
- Expression applies ONLY to segments where the START keyframe is selected
- If keyframe `n` is selected, curve applies to segment `n → n+1`
- If multiple keyframes selected, curve applies to all those segments
- Non-selected segments use linear interpolation (AE's default behavior)

## Usage

1. **Select keyframes** in the timeline for the property you want to animate
2. **Select the property** in the timeline
3. **Adjust curve parameters** in the Animation Curves panel
4. The expression is automatically applied to only the selected keyframe segments

## Example Scenarios

### Scenario 1: Single Selected Keyframe
- Property has keyframes at indices: 1, 2, 3, 4, 5
- User selects keyframe 3
- Result: Curve applies only to segment 3→4
- Segments 1→2, 2→3, 4→5 use linear interpolation

### Scenario 2: Multiple Selected Keyframes
- Property has keyframes at indices: 1, 2, 3, 4, 5
- User selects keyframes 2 and 4
- Result: Curve applies to segments 2→3 and 4→5
- Segments 1→2 and 3→4 use linear interpolation

### Scenario 3: Non-Consecutive Keyframes
- Property has keyframes at indices: 1, 2, 3, 4, 5, 6
- User selects keyframes 2, 4, and 6
- Result: Curve applies to segments 2→3, 4→5, and 6→7 (if exists)
- Other segments use linear interpolation

## Technical Notes

### Keyframe Indexing
- After Effects uses 1-based indexing for keyframes
- `prop.selectedKeys` returns an array of 1-based indices
- The expression's `n` variable (from `nearestKey()`) is also 1-based
- All indices are consistent throughout the implementation

### Expression Efficiency
- The selected keyframe check is minimal overhead
- Uses simple OR conditions: `if (n === 2 || n === 5 || n === 7)`
- No loops or complex logic in the generated expression

### Edge Cases Handled
- No keyframes selected: Property is skipped
- No properties selected: Function returns silently
- Property has no keyframes: Property is skipped
- Property doesn't support expressions: Property is skipped

## Testing

A test script is provided: `test_selected_keyframes.jsx`

This script demonstrates:
1. Expression generation without selected keyframes (backward compatible)
2. Expression generation with single selected keyframe
3. Expression generation with multiple selected keyframes

## Backward Compatibility

The implementation maintains backward compatibility:
- If `selectedKeyIndices` is `undefined` or empty, the expression works as before
- All existing functionality remains unchanged
- The preview panel continues to work normally
