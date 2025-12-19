# PrismCode Extension - Quick Start

## Test the Extension

### 1. Open in VSCode/Cursor/Windsurf/Antigravity

```bash
cd ide-extension
code .
```

### 2. Run Extension (F5)

- Press `F5` to start debugging
- New Extension Development Host window opens
- Extension is now active!

### 3. Try Commands

Open Command Palette (`Cmd/Ctrl+Shift+P`) and search:

- `PrismCode: Generate Project Plan`
- `PrismCode: Open Dashboard`
- `PrismCode: Create GitHub Issues`

Or use keyboard shortcut:

- `Ctrl+Alt+P` (or `Cmd+Alt+P` on Mac)

### 4. View Dashboard

- Click PrismCode icon in sidebar (rocket 🚀)
- Dashboard panel shows on left
- Quick actions available

### 5. Check Output

- View → Output
- Select "PrismCode" from dropdown
- See agent execution logs

## What Works

✅ Extension activation
✅ Commands registered
✅ Notifications working
✅ Output channel logging
✅ Dashboard WebView  
✅ GitHub configuration
✅ Multi-IDE compatible

## What to Test

1. **Generate Plan Without Config:**
   - Should prompt for GitHub setup
   - Enter token, owner, repo
   - Config saved

2. **Generate Plan With Config:**
   - Enter feature description
   - PM Agent analyzes
   - Architect Agent designs
   - Plan shown in output

3. **Dashboard:**
   - Shows quick stats
   - Buttons trigger commands
   - Updates status

## Troubleshooting

**Extension not loading?**

- Check console for errors (Help → Toggle Developer Tools)
- Rebuild: `npm run compile`

**Commands not found?**

- Reload window: `Cmd/Ctrl+Shift+P` → "Reload Window"

**Dashboard not showing?**

- Check sidebar for rocket icon
- Click to open panel

## Next Steps

- Add extension tests
- Publish to marketplace
- Create demo video
