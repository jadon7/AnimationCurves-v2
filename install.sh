#!/bin/bash

# Animation Curves CEP Extension - Install Script

echo "Animation Curves - Installation"
echo "================================"
echo ""

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

# Parse arguments
MODE="copy"
if [ "$1" == "--dev" ]; then
    MODE="symlink"
fi

echo "OS: $OS"
echo "Mode: $MODE"
echo ""

# Step 1: Enable debug mode
echo "[1/3] Enabling CEP debug mode..."
if [ "$OS" == "mac" ]; then
    defaults write com.adobe.CSXS.11 PlayerDebugMode 1
    echo "  Done."
elif [ "$OS" == "win" ]; then
    echo "  Please enable debug mode manually on Windows:"
    echo "    1. Open Registry Editor (regedit)"
    echo "    2. Navigate to: HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.11"
    echo "    3. Create DWORD 'PlayerDebugMode' with value 1"
    echo ""
    read -p "  Press Enter when done..."
fi

# Step 2: Create extensions directory
echo ""
echo "[2/3] Preparing extensions directory..."
mkdir -p "$CEP_DIR"

EXTENSION_DIR="$CEP_DIR/com.animationcurves.panel"

# Remove old installation
if [ -L "$EXTENSION_DIR" ]; then
    rm "$EXTENSION_DIR"
elif [ -d "$EXTENSION_DIR" ]; then
    rm -rf "$EXTENSION_DIR"
fi

# Step 3: Install
echo ""
echo "[3/3] Installing..."
if [ "$MODE" == "symlink" ]; then
    ln -s "$SCRIPT_DIR" "$EXTENSION_DIR"
    echo "  Symlinked to: $SCRIPT_DIR"
else
    mkdir -p "$EXTENSION_DIR"
    # Copy only the required files
    cp -r "$SCRIPT_DIR/CSXS" "$EXTENSION_DIR/"
    cp -r "$SCRIPT_DIR/client" "$EXTENSION_DIR/"
    cp -r "$SCRIPT_DIR/host" "$EXTENSION_DIR/"
    cp "$SCRIPT_DIR/.debug" "$EXTENSION_DIR/" 2>/dev/null
    echo "  Copied to: $EXTENSION_DIR"
fi

echo ""
echo "================================"
echo "Done! Restart After Effects, then open:"
echo "  Window > Extensions > Animation Curves"
echo ""
if [ "$MODE" == "copy" ]; then
    echo "Tip: use './install.sh --dev' for development (symlink mode)."
fi
