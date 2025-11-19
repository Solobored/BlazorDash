# 🎮 Blazor Dash - Quick Reference

## Getting Started (30 seconds)

```bash
cd BlazorDash
dotnet run
# Open: http://localhost:5059
```

## Test Everything (30 seconds)

```bash
cd BlazorDash.Tests
dotnet test
```

Expected: **11/11 tests passing ✅**

---

## File Structure Cheat Sheet

```
BlazorDash/
├── Program.cs              → Startup & DI
├── appsettings.json        → Config
├── Data/
│   ├── GameDbContext.cs    → EF Core setup
│   └── HighScore.cs        → Score model
├── Services/
│   ├── GameService.cs      → Physics & logic ⭐ Main game engine
│   ├── GameModels.cs       → GameState, Obstacle, Rect
│   └── LeaderboardService.cs → Database queries
├── Components/
│   ├── Pages/
│   │   ├── Home.razor      → Main menu
│   │   ├── Game.razor      → Game loop ⭐
│   │   └── Leaderboard.razor → Top 5 scores
│   ├── Layout/
│   │   ├── MainLayout.razor     → Game-themed header
│   │   └── MainLayout.razor.css → Styling
│   └── App.razor           → Root HTML
└── wwwroot/
    ├── game.js             → Canvas rendering ⭐
    └── app.css             → All styling
```

---

## Key Game Constants (in GameService.cs)

```csharp
const float GRAVITY = 2000f;              // px/s²
const float JUMP_VELOCITY = -600f;        // px/s
const float GROUND_Y = 500f;              // player Y position
const float BASE_SPAWN_INTERVAL = 1.5f;   // seconds
const float MIN_SPAWN_INTERVAL = 0.5f;    // seconds
```

Adjust these to tune difficulty!

---

## Database

**File**: `BlazorDash.db` (auto-created)

**Query recent scores**:
```csharp
var topScores = await leaderboardService.GetTopScoresAsync(5);
```

**Add score**:
```csharp
await leaderboardService.AddHighScoreAsync("Player", 1500);
```

---

## Controls

| Input | Action |
|-------|--------|
| SPACE | Jump |
| ↑ Arrow Up | Jump |
| Mouse Click (desktop) | Jump |
| Touch Tap (mobile) | Jump |

---

## Game Loop Flow

1. **Physics Update** → Player gravity, jumping, position
2. **Spawn Obstacles** → Random generation with increasing frequency
3. **Update Obstacles** → Move left, remove off-screen
4. **Collision Check** → AABB detection
5. **Render** → Draw to canvas via JS interop
6. **Update Score** → 10 points per second

**Speed**: 60 times per second (16.67ms per frame)

---

## Testing Cheat Sheet

```bash
# Run all tests
dotnet test

# Run specific test
dotnet test --filter "CheckCollision"

# Run with verbose output
dotnet test -v detailed

# Run and show coverage
dotnet test /p:CollectCoverage=true
```

---

## Debugging

**Enable browser dev tools**: Press `F12`

**Check console**: Look for JavaScript errors in Console tab

**View network**: Check Network tab for JavaScript module load

**Debug canvas**: Inspect Element on canvas to see CSS applied

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Port 5059 in use | Change in `launchSettings.json` |
| "Database locked" | Delete `BlazorDash.db` and restart |
| Canvas not showing | Check browser F12 console for JS errors |
| Slow gameplay | Close other applications |
| No scores saved | Ensure `BlazorDash.db` file is writable |

---

## Customization

### Change Difficulty
Edit `Services/GameService.cs`:
```csharp
GRAVITY = 2500f;           // Harder falling
JUMP_VELOCITY = -700f;     // Higher jumps
BASE_SPAWN_INTERVAL = 1f;  // Faster obstacles
```

### Change Colors
Edit `wwwroot/app.css`:
```css
.game-title { color: #your-color; }
```

### Add Sound
1. Add `.mp3` to `wwwroot/`
2. Create new method in `game.js`
3. Call from Game.razor via JS interop

---

## Deploy to Production

```bash
# Build release
dotnet publish -c Release

# Output in: bin/Release/net9.0/publish/
```

Then deploy to:
- ☁️ Azure App Service
- 🐳 Docker / Kubernetes
- 📱 Self-hosted server
- 🖥️ Windows/Linux VM

---

## Project Stats

| Metric | Value |
|--------|-------|
| Lines of Code | ~3000+ |
| C# Classes | 6 |
| Razor Components | 3 |
| JavaScript Modules | 1 |
| Unit Tests | 11 ✅ All Pass |
| CSS Files | 2 |
| Pages | 3 (Home, Game, Leaderboard) |

---

## Tech Stack

- **.NET 9** - Framework
- **Blazor Server** - Real-time UI
- **Entity Framework Core** - ORM
- **SQLite** - Database
- **xUnit** - Testing
- **HTML Canvas** - Graphics
- **Responsive CSS** - Mobile-first design

---

## Quick Demos

### Play 1 Game
```
1. Open http://localhost:5059
2. Click "Play Game"
3. Press SPACE to jump
4. Avoid obstacles for 10 seconds
5. Enter name → View on Leaderboard
```

### Run Unit Tests
```
cd BlazorDash.Tests
dotnet test
```

### View Database
```
# Install SQLite CLI
sqlite3 BlazorDash.db

# View scores
SELECT * FROM HighScores ORDER BY Score DESC LIMIT 5;
```

---

## Links & Resources

📖 **README**: Full documentation in `README.md`

🧪 **Tests**: See `BlazorDash.Tests/UnitTest1.cs` for examples

🎮 **Game Engine**: Core logic in `Services/GameService.cs`

🖥️ **UI**: Razor components in `Components/Pages/`

🎨 **Styling**: All CSS in `wwwroot/app.css` and `Components/Layout/`

---

## Performance Tips

- ✅ 60 FPS gameplay achieved with fixed timestep
- ✅ Obstacle pooling (auto-cleanup) saves memory
- ✅ SQLite queries indexed on Score for speed
- ✅ Canvas rendering optimized via JS requestAnimationFrame

---

## Next Steps

1. ✅ Run the app: `dotnet run`
2. ✅ Play 2-3 games to see leaderboard
3. ✅ Run tests: `dotnet test`
4. ✅ Read full README for customization
5. ✅ Deploy to production!

---

**Built with ❤️ using .NET 9 & Blazor Server**
