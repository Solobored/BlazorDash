# 🎮 Blazor Dash

A responsive, single-player, obstacle-dodging browser game built with **.NET 9 Blazor Server**. The player controls a character that automatically moves forward and must jump to dodge randomly generated obstacles. Score increases with survival time, and top scores are persisted locally in SQLite.

**Live Demo**: [Run locally with `dotnet run`](#quick-start)

---

## 🎯 Features

### Core Features ✅

- **Smooth Gameplay**: ~60 FPS animation with fixed timestep physics
- **Character Control**: Press SPACE, UP ARROW, or tap to jump
- **Dynamic Obstacles**: Obstacles spawn with increasing frequency and speed over time
- **Collision Detection**: Axis-aligned bounding box (AABB) collision system
- **Scoring System**: 10 points per second survived
- **Persistent Leaderboard**: Top 5 scores saved to local SQLite database
- **Responsive UI**: Mobile-first design, works on desktop and phones
- **Game States**: Main menu, gameplay, game over, leaderboard

### Accessibility & Experience

- Keyboard controls (Space, Arrow Up) + touch support
- Clear UI with animations and visual feedback
- Game Over screen with score entry before restart
- "How to Play" guide on main menu
- Personal statistics tracking

---

## 🚀 Quick Start

### Prerequisites

- **.NET 9** SDK or later ([download here](https://dotnet.microsoft.com/download))
- A modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Running

1. **Clone/Navigate to the project:**

   ```bash
   cd BlazorDash
   ```

2. **Restore dependencies (automatic on first run):**

   ```bash
   dotnet restore
   ```

3. **Run the application:**

   ```bash
   dotnet run
   ```

4. **Open in browser:**

   - Navigate to `http://localhost:5059` (or the URL shown in terminal)
   - The app creates a local SQLite database (`BlazorDash.db`) on first run

5. **Play:**
   - Click **"▶️ Play Game"** on the main menu
   - Press **SPACE** or **UP ARROW** to jump (or tap on mobile)
   - Avoid obstacles and survive as long as possible!
   - View your best scores on the **Leaderboard**

---

## 🏗️ Project Structure

```
BlazorDash/
├── Components/
│   ├── Pages/
│   │   ├── Home.razor              # Main menu
│   │   ├── Game.razor              # Game canvas & loop
│   │   └── Leaderboard.razor       # Top scores display
│   ├── Layout/
│   ├── _Imports.razor              # Global using directives
│   ├── App.razor                   # Root component
│   └── Routes.razor                # Route configuration
├── Data/
│   ├── GameDbContext.cs            # EF Core database context
│   └── HighScore.cs                # High score entity model
├── Services/
│   ├── GameService.cs              # Core game logic (physics, collisions, spawning)
│   ├── GameModels.cs               # GameState, Rect, Obstacle classes
│   └── LeaderboardService.cs       # Database operations for scores
├── wwwroot/
│   ├── game.js                     # Canvas rendering & input handling
│   ├── app.css                     # Responsive styling
│   └── lib/                        # Bootstrap & dependencies
├── Properties/
│   └── launchSettings.json         # Launch configuration
├── Program.cs                      # Dependency injection & startup
├── appsettings.json                # Configuration (connection string)
├── BlazorDash.csproj               # Project file
└── README.md                       # This file
```

---

## 🎮 How to Play

### Gameplay

- Your character **auto-moves forward** in the game world
- **Obstacles appear randomly** from the right side
- **Jump** when obstacles approach to avoid them
- **Survive longer = higher score** (10 points/second)
- **Game Over** = collision with an obstacle

### Controls

| Input                               | Action |
| ----------------------------------- | ------ |
| **SPACE** key                       | Jump   |
| **UP ARROW** key                    | Jump   |
| **Mouse click** on canvas (desktop) | Jump   |
| **Touch tap** on canvas (mobile)    | Jump   |

### Difficulty Progression

- Obstacles spawn more frequently over time
- Obstacle speed increases as the game progresses
- Spawning eventually reaches a minimum interval for challenge

---

## 🔧 Development

### Project Technologies

- **.NET 9** – Web framework
- **Blazor Server** – Real-time UI rendering
- **Entity Framework Core 9.0** – ORM for database
- **SQLite** – Local database (no external services)
- **HTML Canvas** – Game rendering via JavaScript interop
- **C#** – Game logic and physics

### Key Modules

#### 1. **GameService.cs** – Core Game Logic

- **Physics**: Gravity, jump velocity, ground collision
- **Spawning**: Dynamic obstacle generation with increasing frequency
- **Collision Detection**: AABB (axis-aligned bounding box)
- **State Management**: Game state updates each frame

**Key Constants:**

```csharp
const float GRAVITY = 2000f;              // pixels/sec²
const float JUMP_VELOCITY = -600f;        // pixels/sec
const float GROUND_Y = 500f;              // player ground level
const float BASE_SPAWN_INTERVAL = 1.5f;   // seconds
```

#### 2. **Game.razor** – Game Loop & UI

- Initializes the game canvas and JavaScript module
- Implements fixed timestep game loop (~60 FPS)
- Handles player input via JS interop
- Syncs game state to canvas rendering
- Manages game over screen and score persistence

#### 3. **game.js** – Canvas Rendering & Input

- `render(stateJson)` – Draws player, obstacles, score
- `init(canvasEl, dotnetRef)` – Sets up event listeners
- Handles keyboard (Space, ArrowUp) and touch input
- Responsive canvas sizing

#### 4. **LeaderboardService.cs** – Score Persistence

- `AddHighScoreAsync()` – Save a score to the database
- `GetTopScoresAsync(count)` – Retrieve top N scores
- `IsTopScoreAsync()` – Check if score qualifies for leaderboard

---

## 🧪 Testing

Currently, unit tests are designed but not bundled with the app due to xUnit configuration in the primary project. Here's how to set up separate unit tests:

### Create a Test Project (Optional)

```bash
cd ..
dotnet new xunit -o BlazorDash.Tests
cd BlazorDash.Tests
dotnet add reference ../BlazorDash/BlazorDash.csproj
```

### Example Unit Tests (See `GameServiceTests.cs`)

```csharp
[Fact]
public void CheckCollision_DetectsIntersection()
{
    var state = gameService.NewGame();
    // Create player & obstacle at same position
    var collision = gameService.CheckCollision(state);
    Assert.True(collision);
}

[Fact]
public void Step_UpdatesScoreWithTime()
{
    var state = gameService.NewGame();
    gameService.Step(state, 1f);  // 1 second
    Assert.Equal(10, state.Score); // 10 points/second
}
```

### Run Tests (if separate project exists)

```bash
cd BlazorDash.Tests
dotnet test
```

---

## 📊 Game State & Physics

### GameState Structure

```csharp
public class GameState
{
    public float PlayerX, PlayerY, PlayerVelocityY;
    public List<Obstacle> Obstacles;
    public int Score;
    public bool IsGameOver;
    public float ElapsedSeconds;
}
```

### Physics Calculations

```
Each frame:
1. vy += gravity * dt           (apply gravity)
2. y += vy * dt                 (update position)
3. Clamp y to ground when y >= GROUND_Y
```

### Obstacle Spawning

```
spawn_interval = max(BASE - SPEED_FACTOR * time, MIN)
// Interval reduces over time, increasing spawn frequency
```

---

## 📱 Responsive Design

The UI is **mobile-first**:

- Canvas resizes to fit container width (max 800px)
- Touch input support for mobile
- Responsive button layout for small screens
- Optimized font sizes for readability

**Tested on:**

- Desktop (Chrome, Edge, Firefox)
- Tablet (iPad, Android tablets)
- Mobile (iPhone, Android phones)

---

## 🗄️ Database

### SQLite Schema

```sql
CREATE TABLE "HighScores" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "PlayerName" TEXT NOT NULL,
    "Score" INTEGER NOT NULL,
    "DateAchieved" TEXT NOT NULL
);
```

The database is created automatically on first run (`BlazorDash.db`).

### Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=BlazorDash.db"
  }
}
```

---

## 🐛 Troubleshooting

| Issue                    | Solution                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| **Port already in use**  | Change port in `Properties/launchSettings.json`                        |
| **Database locked**      | Ensure no other instances are running; delete `BlazorDash.db` to reset |
| **Canvas not rendering** | Check browser console (F12) for JavaScript errors                      |
| **Game loop slow**       | Close other applications; check browser performance monitor            |

---

## 🎨 Customization

### Adjust Game Difficulty

Edit `Services/GameService.cs`:

```csharp
private const float GRAVITY = 2000f;           // Increase for faster falling
private const float JUMP_VELOCITY = -600f;     // Increase for higher jumps
private const float BASE_SPAWN_INTERVAL = 1.5f; // Decrease for faster spawning
```

### Change Canvas Size

Edit `wwwroot/game.js`:

```javascript
function resizeCanvas() {
  canvas.width = 1200; // Change width
  canvas.height = 600; // Change height
}
```

### Modify Colors & Styling

Edit `wwwroot/app.css` for color scheme and layout.

---

## 🚀 Future Enhancements

- [ ] Sound effects & background music (with mute toggle)
- [ ] Particle effects on jump & collision
- [ ] Different obstacle types & patterns
- [ ] Power-ups (shield, slow-motion, etc.)
- [ ] Multiplayer leaderboard (cloud sync)
- [ ] Replay system (record & playback)
- [ ] Animation polish & visual effects
- [ ] Dark mode
- [ ] Settings menu (difficulty, controls, audio)

---

## 📜 License

This project is provided as-is for educational and recreational purposes.

---

## 🙏 Credits

Built with:

- **Microsoft .NET 9**
- **Blazor Server**
- **Entity Framework Core**
- **SQLite**

---

## 📞 Questions?

For issues, suggestions, or questions:

1. Check the **Troubleshooting** section above
2. Review the code comments in `GameService.cs` for physics details
3. Inspect browser console (F12) for runtime errors

---

## 🎬 Demo Video

To record a demo:

```bash
# 1. Start the app
dotnet run

# 2. Open browser dev tools (F12) > Sources/Console
# 3. Use screen recording tool (built-in or OBS)
# 4. Play a few rounds and save the recording
```

---

**Enjoy Blazor Dash! 🎮✨**
