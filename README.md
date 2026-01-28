# Cult of the Lamb - Switch to PC Save Converter

A browser-based tool to convert Cult of the Lamb save files from Nintendo Switch to PC format.

## ⚠️ Important
**This tool officially supports Legacy (JSON) Switch saves only.** While the tool *can* technically process newer Woolhaven (MP) saves, **they are not supported and will likely result in game-breaking bugs** on PC (e.g., time freezing, followers not moving, unable to save).

## Features

- **100% Client-Side** - No uploads, everything runs in your browser
- **Auto-Detection** - Automatically detects JSON (legacy) format
- **Drag & Drop** - Simple interface for converting multiple files at once

## Usage

1. Open `index.html` in any modern browser.
2. Drag and drop your Switch save files.
3. **If you upload a modern (MP) save, you will receive a warning.**
4. Click "Convert & Download".
5. Place the converted files in your PC save folder.

### PC Save Location (Windows)
```
%USERPROFILE%\AppData\LocalLow\Massive Monster\Cult Of The Lamb\saves\
```

## File Conversions

| Switch File | Status | PC File |
|------------|---|---------|
| `slot_0` | ✅ Supported | `slot_0.json` |
| `meta_0` | ✅ Supported | `meta_0.json` |
| `slot_0MP` | ❌ **Buggy / Unsupported** | `slot_0.mp` |

## Important: Achievements

Achievements currently do not sync. I recommend using [Steam Achievement Manager](https://github.com/gibbed/SteamAchievementManager) to manually unlock achievements after moving to Steam.

## FAQ

**Q: Why are MP saves not supported?** The PC version handles the binary structure of MessagePack files differently than the Switch version. Converting them often results in a "Zombie State" where the game loads, but time does not advance and scripts do not run.

**Q: Can I convert MP saves anyway?** Yes, the tool allows you to bypass the warning, but your save file will likely be unplayable. We recommend only converting Legacy JSON saves.

## Support

[Nexus Mods](https://www.nexusmods.com/cultofthelamb/mods/57)
☕ [Support on Ko-fi](https://ko-fi.com/0dm)

## Disclaimer

Not affiliated with Massive Monster or Devolver Digital. 
