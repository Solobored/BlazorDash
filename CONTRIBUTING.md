# 🤝 Contributing to Blazor Dash

Thank you for interest in contributing! Here's how you can help improve Blazor Dash.

## Development Setup

### 1. Clone/Fork Repository
```bash
git clone <repository-url>
cd BlazorDash
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Build Project
```bash
dotnet build
```

### 4. Run Tests
```bash
cd BlazorDash.Tests
dotnet test
```

### 5. Run Application
```bash
cd ../BlazorDash
dotnet run
```

---

## Project Structure

```
BlazorDash/
├── Components/          # Razor UI components
│   ├── Pages/          # Page components (Home, Game, Leaderboard)
│   └── Layout/         # Layout & navigation
├── Services/           # Business logic
│   ├── GameService.cs     # Physics, collision, spawning
│   ├── LeaderboardService.cs # Score persistence
│   └── GameModels.cs       # GameState, Obstacle, Rect
├── Data/               # Database models
│   ├── GameDbContext.cs    # EF Core context
│   └── HighScore.cs        # Score entity
├── wwwroot/            # Static assets
│   ├── game.js         # Canvas rendering & input
│   └── app.css         # Styling
└── BlazorDash.Tests/   # Unit tests

BlazorDash.Tests/
├── UnitTest1.cs        # GameService tests (11 tests)
└── BlazorDash.Tests.csproj
```

---

## Code Style Guide

### C# Conventions
- Use **PascalCase** for public methods/properties
- Use **camelCase** for private fields and local variables
- Add **XML documentation comments** for public APIs
- Use **file-scoped namespaces** (`namespace BlazorDash.Services;`)
- Prefer **expression-bodied members** for simple properties

Example:
```csharp
/// <summary>
/// Calculates collision between two rectangles.
/// </summary>
public bool CheckCollision(GameState state) 
{
    var playerBounds = state.GetPlayerBounds();
    foreach (var obstacle in state.Obstacles)
    {
        if (playerBounds.Intersects(obstacle.GetBounds()))
            return true;
    }
    return false;
}
```

### CSS Conventions
- Use **kebab-case** for class names
- Organize by component/section
- Mobile-first responsive design
- Use CSS custom properties for colors/spacing

```css
.game-title {
    font-size: 3.5em;
    color: var(--primary-color);
    transition: all 0.3s ease;
}

@media (max-width: 768px) {
    .game-title {
        font-size: 2em;
    }
}
```

### JavaScript Conventions
- Use **camelCase** for functions and variables
- Add **JSDoc comments** for exported functions
- No external dependencies (vanilla JS only)

```javascript
/**
 * Renders game state to canvas
 * @param {string} stateJson - JSON serialized GameState
 */
export function render(stateJson) {
    const state = JSON.parse(stateJson);
    // Implementation...
}
```

---

## Commit Message Format

Use clear, descriptive commit messages:

```
feat: Add particle effects on jump
fix: Correct collision detection edge case
docs: Update README with new features
test: Add tests for obstacle spawning
style: Improve button hover animation
refactor: Extract physics constants
```

---

## Pull Request Process

1. **Create feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** with clean commits

3. **Run tests:**
   ```bash
   dotnet test
   dotnet build
   ```

4. **Push to branch:**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create Pull Request** with:
   - Clear description of changes
   - Link to related issues
   - Screenshots (for UI changes)
   - Test results

---

## Testing Requirements

All code changes must include tests:

### Unit Tests
```csharp
[Fact]
public void YourFeature_DoesExpectedBehavior()
{
    // Arrange
    var service = new GameService();
    var state = service.NewGame();

    // Act
    var result = service.Step(state, 0.016f);

    // Assert
    Assert.NotNull(result);
    Assert.True(result.Score >= 0);
}
```

### Running Tests
```bash
cd BlazorDash.Tests
dotnet test
dotnet test --logger "console;verbosity=detailed"
```

---

## Common Improvements

### Easy First-Time Contributions

- [ ] Add keyboard shortcut hints in UI
- [ ] Improve error messages
- [ ] Add more unit tests
- [ ] Enhance CSS animations
- [ ] Fix typos in docs

### Medium Difficulty

- [ ] Add settings menu (difficulty levels)
- [ ] Implement pause functionality
- [ ] Add sound effect toggles
- [ ] Create leaderboard filters
- [ ] Improve mobile responsiveness

### Advanced Features

- [ ] Multiplayer support (SignalR)
- [ ] Advanced obstacle patterns
- [ ] Power-up system
- [ ] Replay/recording system
- [ ] Local storage for personal stats
- [ ] Dark mode theme

---

## Performance Tips

### Canvas Rendering
- Minimize redraws
- Use `requestAnimationFrame` for smooth updates
- Cache computed values

### Physics
- Use fixed timestep for consistency
- Pre-calculate common values
- Avoid expensive operations in hot loops

### Database
- Use async/await for DB operations
- Consider caching frequently accessed data
- Use batch operations when possible

### Memory
- Clean up obstacles that leave screen
- Dispose resources properly
- Avoid memory leaks in event handlers

---

## Debugging

### Browser DevTools
- **F12** to open developer tools
- **Console** tab for JavaScript errors
- **Network** tab to check API calls
- **Performance** tab for profiling

### Server-Side Debugging
```bash
# Enable debug logging
export DOTNET_LOG_LEVEL=Debug
dotnet run

# Use Visual Studio debugging
# Set breakpoints in code (F9)
# Run with F5
```

### Common Issues
1. **Canvas not rendering:**
   - Check browser console for errors
   - Verify game.js is loaded
   - Check network tab for 404s

2. **Game feels slow:**
   - Check FPS (should be ~60)
   - Monitor CPU/GPU usage
   - Profile in Chrome DevTools

3. **Database errors:**
   - Check BlazorDash.db exists
   - Verify file permissions
   - Check database schema

---

## Documentation

When adding features, update:

1. **Code comments** - Explain "why", not "what"
2. **XML docs** - For public APIs
3. **README.md** - User-facing features
4. **DEPLOYMENT.md** - Infrastructure changes
5. **This file** - Development process changes

---

## Code Review Checklist

Before submitting PR, ensure:

- ✅ Code compiles without warnings
- ✅ All tests pass
- ✅ No breaking changes (or documented)
- ✅ Code follows style guide
- ✅ Comments/docs are clear
- ✅ No hardcoded values (use constants)
- ✅ Handles edge cases
- ✅ Performance impact considered

---

## Questions?

- 📖 Read README.md for feature overview
- 🔧 Check DEPLOYMENT.md for infrastructure
- 🧪 Review BlazorDash.Tests for examples
- 💬 Comment on issues for clarification

---

**Thank you for contributing to Blazor Dash! 🎮✨**
