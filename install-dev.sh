#!/bin/bash

# Installation script for Animation Curves CEP Extension (Development Mode)

echo "Animation Curves CEP Extension - Development Installation"
echo "=========================================================="
echo ""

# Get the directory where this script lives (project root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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
    echo "Done."
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
echo "Done."

# Create symlink
echo ""
echo "Step 3: Installing extension (symlink)..."
EXTENSION_DIR="$CEP_DIR/com.animationcurves.panel"

if [ -L "$EXTENSION_DIR" ]; then
    echo "Removing old symlink..."
    rm "$EXTENSION_DIR"
elif [ -d "$EXTENSION_DIR" ]; then
    echo "Removing old copy..."
    rm -rf "$EXTENSION_DIR"
fi

ln -s "$SCRIPT_DIR" "$EXTENSION_DIR"
echo "Symlinked: $EXTENSION_DIR -> $SCRIPT_DIR"

# Check for CSInterface.js
echo ""
echo "Step 4: Checking for CSInterface.js..."
if [ ! -f "$SCRIPT_DIR/client/lib/CSInterface.js" ]; then
    echo "CSInterface.js not found!"
    echo ""
    echo "Please download it from:"
    echo "https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/CSInterface.js"
    echo ""
    echo "And place it in: $SCRIPT_DIR/client/lib/CSInterface.js"
else
    echo "CSInterface.js found."
fi

echo ""
echo "=========================================================="
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart Adobe After Effects"
echo "2. Go to Window > Extensions > Animation Curves"
echo ""
