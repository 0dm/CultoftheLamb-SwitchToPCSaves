# Cult of the Lamb - Switch to PC Save Converter

A browser-based tool to convert Cult of the Lamb save files from Nintendo Switch to PC format. Currently does not convert from PC to Switch, though this will likely be added in the future. 

## Features

- **100% Client-Side** - No uploads, everything runs in your browser
- **Auto-Detection** - Automatically detects JSON (legacy) or MessagePack (new) formats
- **Drag & Drop** - Simple interface for converting multiple files at once
- **Both Formats Supported**:
  - Legacy saves (ZB header) → `.json` files
  - New saves (MP header) → `.mp` files

## Usage

1. Open `index.html` in any modern browser (or click the link on the side of this page)
2. Drag and drop your Switch save files (or click to browse)
3. Click "Convert & Download"
4. Place the converted files in your PC save folder

### PC Save Location (Windows)
```
%USERPROFILE%\AppData\LocalLow\Massive Monster\Cult Of The Lamb\saves\
```

## File Conversions

| Switch File | → | PC File |
|------------|---|---------|
| `slot_0MP` | → | `slot_0.mp` |
| `meta_0MP` | → | `meta_0.mp` |
| `slot_0` | → | `slot_0.json` |
| `meta_0` | → | `meta_0.json` |
| `persistence` | → | `persistence.json` |

## Support

☕ [Support on Ko-fi](https://ko-fi.com/0dm)

## Disclaimer

Not affiliated with Massive Monster or Devolver Digital.
