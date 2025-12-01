# W05 Team Activity: Project Checkpoint Report

## 1. Summary of Group Meeting and Weekly Activity

### Challenges Encountered
- **Game Loading Issues**: The game page was stuck on a "Loading..." screen and not displaying the actual game canvas. The `/game` route was returning HTTP 404 errors.
- **Rendering Problems**: Once the game loaded, the player character, obstacles, and score/time displays were not rendering correctly on the canvas.
- **Interactive Mode Configuration**: Pages were not properly configured with interactive render mode, preventing event handlers and JavaScript interop from functioning.
- **JSON Serialization**: Property naming mismatches between C# (PascalCase) and JavaScript (camelCase) caused rendering failures.
- **Syntax Errors**: Several syntax errors in the Game.razor component prevented successful compilation.

### Successes Achieved
- **Fixed Route Configuration**: Resolved the 404 error by fixing the `@page` directive syntax error and ensuring proper route registration.
- **Implemented Interactive Rendering**: Configured all pages with `InteractiveServer` render mode, enabling proper JavaScript interop and event handling.
- **Resolved Game Rendering**: Fixed canvas rendering to properly display the player character, obstacles, score, and time at the top of the game canvas.
- **JSON Serialization Fix**: Configured camelCase JSON serialization policy to ensure proper data transfer between C# and JavaScript.
- **Game Functionality**: The game now properly initializes, spawns obstacles, handles player input (jump), and tracks score/time correctly.

### New Tasks Completed
- Fixed game initialization and canvas rendering
- Implemented proper JSON serialization with camelCase naming
- Updated JavaScript rendering logic to handle normalized game state
- Fixed syntax errors preventing compilation
- Added defensive null checks in rendering code

### Change Orders
- Modified `Game.razor` to use camelCase JSON serialization options
- Updated `game.js` to normalize state data and handle both PascalCase and camelCase properties
- Configured `App.razor` and `Routes.razor` with interactive server render mode
- Fixed `@page` directive syntax error in Game.razor component

## 2. Participants

The following team members participated in the live group meeting:

- **Josue Neiculeo**
- **Cristobal Baeriswyl**

## 3. Project Management URLs

- **Trello Board**: https://trello.com/b/enSL02Yh/net-software-development
- **GitHub Repository**: https://github.com/Solobored/BlazorDash

## 4. Personal Task Report

### Task: Fix Game Rendering and Display Issues

**Description**: 
This task involved resolving critical issues preventing the BlazorDash game from displaying and functioning correctly. The game was stuck on a loading screen and not rendering the player character, obstacles, or game statistics.

**Functionality**:
- **Game Initialization**: Fixed the game initialization process to properly load the JavaScript module and initialize the canvas element
- **Canvas Rendering**: Implemented proper rendering logic to display the player character (cyan box), obstacles (red rectangles), score, and elapsed time on the game canvas
- **JSON Serialization**: Configured the C# backend to serialize game state data using camelCase naming convention, ensuring compatibility with JavaScript expectations
- **State Normalization**: Created a normalization function in JavaScript to handle both PascalCase and camelCase property names for robust data handling
- **Interactive Mode**: Enabled interactive server rendering mode to allow proper JavaScript interop and event handling

**Fit Within Project Scope**:
This task was essential to the core functionality of the BlazorDash game project. Without proper rendering, the game was completely non-functional. The fixes ensure that:
- Players can see the game state visually
- The game loop runs correctly and updates the display
- User input (jump) is properly handled and reflected in the game
- Score and time tracking are visible to the player
- The game meets the minimum viable product requirements for gameplay

**Technical Challenges Overcome**:
1. Resolved route configuration issues causing 404 errors
2. Fixed JSON property naming mismatches between C# and JavaScript
3. Corrected syntax errors preventing compilation
4. Implemented proper canvas rendering with defensive null checks
5. Configured interactive render mode for proper component lifecycle

**Files Modified**:
- `Components/Pages/Game.razor` - Fixed syntax errors and JSON serialization
- `wwwroot/game.js` - Updated rendering logic and state normalization
- `Components/App.razor` - Configured interactive render mode
- `Components/_Imports.razor` - Added necessary using directives

---

**Report Date**: Week 5  
**Project**: BlazorDash - Obstacle Dodging Game  
**Status**: Game rendering and display functionality fully operational

