# Animation Curves CEP Extension

This is the CEP (Common Extensibility Platform) version of Animation Curves, which provides a dockable panel interface for Adobe After Effects.

## Features

- **Dockable Panel**: Can be docked into After Effects workspace
- **Modern UI**: HTML/CSS/JavaScript-based interface with dark theme
- **Real-time Preview**: Canvas-based curve visualization
- **Auto-apply**: Automatically applies curves when parameters change
- **All Platforms**: Supports Rive, Folme, Android, and iOS curves

## Installation

### Development Mode

1. **Enable Debug Mode**:
   - macOS: `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`
   - Windows: Create registry key `HKEY_CURRENT_USER/Software/Adobe/CSXS.11` with `PlayerDebugMode` = `1`

2. **Copy Extension Folder**:
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/`
   - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`

   Copy the entire `cep-extension` folder to this location and rename it to `com.animationcurves.panel`

3. **Download CSInterface.js**:
   Download from: https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/CSInterface.js

   Place it in: `cep-extension/client/lib/CSInterface.js`

4. **Complete Expression Generator**:
   The `expression-generator.jsx` file needs to be completed with the full expression generation code from `AnimationCurves.jsx` (lines 216-520).

5. **Restart After Effects**:
   - Launch After Effects
   - Go to `Window > Extensions > Animation Curves`

### Production Build

For production distribution, you'll need to:

1. Create icons (23x23px) for the panel:
   - icon-normal.png
   - icon-rollover.png
   - icon-disabled.png
   - icon-dark-normal.png
   - icon-dark-rollover.png

2. Sign the extension with a certificate

3. Package as .zxp file using ZXPSignCmd

## File Structure

```
cep-extension/
├── CSXS/
│   └── manifest.xml          # Extension manifest
├── .debug                     # Debug configuration
├── client/                    # Front-end (HTML/CSS/JS)
│   ├── index.html            # Main UI
│   ├── styles.css            # Dark theme styles
│   ├── curves.js             # Curve mathematics
│   ├── main.js               # Application logic
│   ├── lib/
│   │   └── CSInterface.js    # Adobe CEP library (download separately)
│   └── icons/                # Panel icons (create these)
└── host/                      # Back-end (ExtendScript)
    ├── index.jsx             # Main host script
    └── expression-generator.jsx  # Expression generation (needs completion)
```

## Development

### Debugging

1. Open Chrome DevTools:
   - Navigate to: `http://localhost:8088`
   - This will show the CEP panel's console

2. Check ExtendScript errors:
   - Use ExtendScript Toolkit
   - Or check After Effects' scripting console

### Making Changes

- **UI Changes**: Edit files in `client/` folder
- **Logic Changes**: Edit `client/main.js`
- **Host Script**: Edit `host/index.jsx`
- After changes, reload the extension in After Effects

## TODO

- [ ] Download and add CSInterface.js
- [ ] Complete expression-generator.jsx with full code
- [ ] Create panel icons
- [ ] Test in After Effects
- [ ] Add error handling and user feedback
- [ ] Create production build script
- [ ] Sign and package for distribution

## Comparison with ExtendScript Version

| Feature | ExtendScript | CEP |
|---------|-------------|-----|
| Installation | Copy single .jsx file | Install extension folder |
| UI | ScriptUI (native) | HTML/CSS/JS (modern) |
| Dockable | ❌ Floating window | ✅ Dockable panel |
| Compatibility | AE CC 2015+ | AE CC 2015+ |
| Development | Simple | More complex |
| Distribution | Single file | Packaged .zxp |

## Resources

- [Adobe CEP Resources](https://github.com/Adobe-CEP/CEP-Resources)
- [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md)
- [Getting Started with CEP](https://fxis.ai/edu/getting-started-with-cep-extensions/)

## License

Same as the main AnimationCurves project.
