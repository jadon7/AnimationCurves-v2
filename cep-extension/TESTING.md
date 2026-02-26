# CEP Extension Testing Guide

## After Fixing the ExtendScript Error

The expression-generator.jsx file has been fixed. Now follow these steps to test:

### 1. Restart After Effects
- Completely quit After Effects
- Reopen After Effects

### 2. Open the Extension
- Go to `Window > Extensions > Animation Curves`
- The panel should now load without errors

### 3. Expected Behavior

You should see:
- **Tabs**: Rive, Folme, Android, iOS at the top
- **Curve Dropdown**: Shows available curves for selected platform
- **Parameters Panel**: Sliders and inputs for curve parameters
- **Preview Canvas**: Black canvas with blue curve at the bottom

### 4. Test Basic Functionality

1. **Create a test composition**:
   - New Comp (Cmd+N)
   - Add a solid layer
   - Add Position keyframes (P key, click stopwatch)
   - Move to different time, change position

2. **Select keyframes**:
   - Select the first keyframe in timeline
   - The keyframe should be highlighted

3. **Apply a curve**:
   - In the CEP panel, select a platform (e.g., Android)
   - Adjust parameters (e.g., Tension slider)
   - The curve preview should update in real-time
   - The curve should auto-apply to selected keyframes

4. **Verify the expression**:
   - Select the Position property
   - Press E to reveal expressions
   - You should see the generated expression code

### 5. Debugging (If Issues Occur)

**Check Chrome DevTools**:
```
http://localhost:8088
```
- Look for JavaScript errors in Console tab
- Check Network tab for failed resource loads

**Check After Effects Console**:
- ExtendScript errors will show in AE's scripting console
- Look for syntax errors or runtime errors

**Common Issues**:

1. **Blank panel**:
   - Check if CSInterface.js is loaded
   - Open DevTools to see JavaScript errors

2. **"Cannot execute script" error**:
   - Check host/expression-generator.jsx syntax
   - Verify #include path is correct

3. **Curves not applying**:
   - Make sure keyframes are selected (not just the property)
   - Check that property can have expressions
   - Look for errors in DevTools

### 6. Compare with ExtendScript Version

If CEP version has issues, you can always fall back to the ExtendScript version:
```
File > Scripts > Run Script File...
Select: AnimationCurves.jsx
```

Both versions should produce identical results.

## Success Criteria

✅ Panel loads without errors
✅ All 4 platform tabs work
✅ Curve preview updates when adjusting parameters
✅ Curves apply to selected keyframes automatically
✅ Generated expressions work correctly in After Effects

## Next Steps After Testing

Once confirmed working:
1. Merge the feat/cep-extension branch to main
2. Update documentation with installation instructions
3. Create production build (optional)
4. Package as .zxp for distribution (optional)
