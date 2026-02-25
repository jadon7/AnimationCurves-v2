#!/bin/bash

# Installation script for Animation Curves CEP Extension (Development Mode)

echo "Animation Curves CEP Extension - Development Installation"
echo "=========================================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    OS="win"
    CEP_DIR="C:/Program Files (x86)/Common Files/Adobe/CEP/extensions"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Detected OS: $OS"
echo "CEP Extensions Directory: $CEP_DIR"
echo ""

# Enable debug mode
echo "Step 1: Enabling CEP Debug Mode..."
if [ "$OS" == "mac" ]; then
    defaults write com.adobe.CSXS.11 PlayerDebugMode 1
    echo "✓ Debug mode enabled (macOS)"
elif [ "$OS" == "win" ]; then
    echo "Please manually enable debug mode on Windows:"
    echo "  1. Open Registry Editor (regedit)"
    echo "  2. Navigate to: HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.11"
    echo "  3. Create DWORD 'PlayerDebugMode' with value 1"
    echo ""
    read -p "Press Enter when done..."
fi

# Create CEP extensions directory if it doesn't exist
echo ""
echo "Step 2: Creating CEP extensions directory..."
mkdir -p "$CEP_DIR"
echo "✓ Directory ready"

# Copy extension
echo ""
echo "Step 3: Installing extension..."
EXTENSION_DIR="$CEP_DIR/com.animationcurves.panel"

if [ -d "$EXTENSION_DIR" ]; then
    echo "Extension already exists. Removing old version..."
    rm -rf "$EXTENSION_DIR"
fi

cp -r "$(dirname "$0")" "$EXTENSION_DIR"
echo "✓ Extension installed to: $EXTENSION_DIR"

# Check for CSInterface.js
echo ""
echo "Step 4: Checking for CSInterface.js..."
if [ ! -f "$EXTENSION_DIR/client/lib/CSInterface.js" ]; then
    echo "⚠ CSInterface.js not found!"
    echo ""
    echo "Please download it from:"
    echo "https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/CSInterface.js"
    echo ""
    echo "And place it in:"
    echo "$EXTENSION_DIR/client/lib/CSInterface.js"
else
    echo "✓ CSInterface.js found"
fi

echo ""
echo "=========================================================="
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart Adobe After Effects"
echo "2. Go to Window > Extensions > Animation Curves"
echo "3. For debugging, open Chrome DevTools at: http://localhost:8088"
echo ""
echo "If the extension doesn't appear, check:"
echo "- Debug mode is enabled"
echo "- Extension folder is in the correct location"
echo "- After Effects has been restarted"
echo ""
