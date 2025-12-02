namespace BlazorDash.Services;

/// <summary>
/// Core game logic service for BlazorDash.
/// Handles physics, obstacle spawning, collision detection, and game state updates.
/// Implements a fixed timestep physics simulation for consistent gameplay across all devices.
/// </summary>
public class GameService
{
  // Physics constants
  /// <summary>Gravitational acceleration in pixels per second squared.</summary>
  private const float GRAVITY = 2000f;

  /// <summary>Initial jump velocity in pixels per second (negative = upward).</summary>
  private const float JUMP_VELOCITY = -700f;

  /// <summary>Vertical position of the ground line in pixels.</summary>
  private const float GROUND_Y = 500f;

  /// <summary>Maximum number of consecutive jumps allowed (enables multi-jump gameplay).</summary>
  private const int MAX_JUMPS = 3;

  // Game constants
  /// <summary>Base interval in seconds between obstacle spawns at game start.</summary>
  private const float BASE_SPAWN_INTERVAL = 2.5f;

  /// <summary>Minimum spawn interval in seconds, prevents overcrowding at high speeds.</summary>
  private const float MIN_SPAWN_INTERVAL = 1.0f;

  /// <summary>Factor controlling how much faster obstacles spawn over time.</summary>
  private const float SPAWN_SPEED_FACTOR = 0.08f;

  /// <summary>Base velocity of obstacles in pixels per second (negative = moving left).</summary>
  private const float OBSTACLE_BASE_SPEED = -200f;

  /// <summary>Factor controlling how much faster obstacles move over time.</summary>
  private const float OBSTACLE_SPEED_FACTOR = 20f;

  // Game dimensions
  /// <summary>Canvas width in pixels.</summary>
  private const float CANVAS_WIDTH = 800f;

  /// <summary>Canvas height in pixels.</summary>
  private const float CANVAS_HEIGHT = 600f;

  /// <summary>Standard obstacle width in pixels.</summary>
  private const float OBSTACLE_WIDTH = 50f;

  /// <summary>Minimum obstacle height in pixels.</summary>
  private const float OBSTACLE_HEIGHT_MIN = 60f;

  /// <summary>Maximum obstacle height in pixels.</summary>
  private const float OBSTACLE_HEIGHT_MAX = 150f;

  private Random _random = new();
  private float _lastSpawnTime = 0f;
  private float _nextSpawnTime = BASE_SPAWN_INTERVAL;

  /// <summary>
  /// Creates a new game state with initial values.
  /// </summary>
  public GameState NewGame()
  {
    return new GameState
    {
      PlayerX = 100f,
      PlayerY = GROUND_Y - 40f, // Position so bottom aligns with ground (40 is player height)
      PlayerVelocityY = 0f,
      PlayerWidth = 40f,
      PlayerHeight = 40f,
      JumpsRemaining = MAX_JUMPS,
      Obstacles = [],
      Score = 0,
      IsGameOver = false,
      ElapsedSeconds = 0f
    };
  }

  /// <summary>
  /// Updates the game state by one time step.
  /// </summary>
  /// <param name="state">Current game state</param>
  /// <param name="deltaTime">Time elapsed since last update in seconds</param>
  /// <returns>Updated game state</returns>
  public GameState Step(GameState state, float deltaTime)
  {
    if (state.IsGameOver)
      return state;

    // Cap deltaTime to prevent large jumps
    deltaTime = Math.Min(deltaTime, 0.033f); // ~30ms max

    // Update elapsed time and score
    state.ElapsedSeconds += deltaTime;
    state.Score = (int)(state.ElapsedSeconds * 10); // 10 points per second

    // Update player physics
    UpdatePlayerPhysics(state, deltaTime);

    // Spawn new obstacles
    SpawnObstacles(state, deltaTime);

    // Update existing obstacles
    UpdateObstacles(state, deltaTime);

    // Check collisions
    if (CheckCollision(state))
    {
      state.IsGameOver = true;
    }

    return state;
  }

  /// <summary>
  /// Updates player vertical physics (gravity and jumping).
  /// </summary>
  private void UpdatePlayerPhysics(GameState state, float deltaTime)
  {
    // Apply gravity
    state.PlayerVelocityY += GRAVITY * deltaTime;

    // Update position
    state.PlayerY += state.PlayerVelocityY * deltaTime;

    // Clamp to ground (player bottom should be at GROUND_Y)
    float playerBottom = state.PlayerY + state.PlayerHeight;
    if (playerBottom >= GROUND_Y)
    {
      state.PlayerY = GROUND_Y - state.PlayerHeight;
      state.PlayerVelocityY = 0;
      // Reset jumps when on ground
      state.JumpsRemaining = MAX_JUMPS;
    }
  }

  /// <summary>
  /// Applies a jump impulse to the player.
  /// Supports double jump - can jump once on ground and once in air.
  /// </summary>
  public void PlayerJump(GameState state)
  {
    if (state.IsGameOver)
      return;

    // Check if on ground
    float playerBottom = state.PlayerY + state.PlayerHeight;
    bool onGround = Math.Abs(playerBottom - GROUND_Y) < 1f;

    // Reset jumps when on ground
    if (onGround)
    {
      state.JumpsRemaining = MAX_JUMPS;
    }

    // Can jump if we have jumps remaining
    if (state.JumpsRemaining > 0)
    {
      state.PlayerVelocityY = JUMP_VELOCITY;
      state.JumpsRemaining--;
    }
  }

  /// <summary>
  /// Spawns new obstacles based on elapsed time.
  /// Spawn rate increases over time.
  /// </summary>
  private void SpawnObstacles(GameState state, float deltaTime)
  {
    // Calculate dynamic spawn interval
    float spawnInterval = Math.Max(
        BASE_SPAWN_INTERVAL - (SPAWN_SPEED_FACTOR * state.ElapsedSeconds),
        MIN_SPAWN_INTERVAL
    );

    _lastSpawnTime += deltaTime;

    if (_lastSpawnTime >= _nextSpawnTime)
    {
      _lastSpawnTime = 0f;
      _nextSpawnTime = spawnInterval;

      // Generate obstacle with random height
      float height = OBSTACLE_HEIGHT_MIN +
                     (float)_random.NextDouble() * (OBSTACLE_HEIGHT_MAX - OBSTACLE_HEIGHT_MIN);

      var obstacle = new Obstacle
      {
        X = CANVAS_WIDTH,
        Y = GROUND_Y - height, // Bottom of obstacle at ground level, extends upward
        Width = OBSTACLE_WIDTH,
        Height = height,
        VelocityX = OBSTACLE_BASE_SPEED - (OBSTACLE_SPEED_FACTOR * state.ElapsedSeconds)
      };

      state.Obstacles.Add(obstacle);
    }
  }

  /// <summary>
  /// Updates all obstacles and removes ones that have left the screen.
  /// </summary>
  private void UpdateObstacles(GameState state, float deltaTime)
  {
    foreach (var obstacle in state.Obstacles)
    {
      obstacle.X += obstacle.VelocityX * deltaTime;
    }

    // Remove obstacles that have exited the left side of the screen
    state.Obstacles.RemoveAll(o => o.X + o.Width < 0);
  }

  /// <summary>
  /// Checks if the player has collided with any obstacle.
  /// Uses AABB (axis-aligned bounding box) collision detection.
  /// </summary>
  public bool CheckCollision(GameState state)
  {
    var playerBounds = state.GetPlayerBounds();

    foreach (var obstacle in state.Obstacles)
    {
      if (playerBounds.Intersects(obstacle.GetBounds()))
      {
        return true;
      }
    }

    return false;
  }

  /// <summary>
  /// Gets statistics about the current game for debugging.
  /// </summary>
  public string GetDebugInfo(GameState state)
  {
    return $"Time: {state.ElapsedSeconds:F2}s | Score: {state.Score} | " +
           $"Player Y: {state.PlayerY:F1} | Obstacles: {state.Obstacles.Count} | " +
           $"GameOver: {state.IsGameOver}";
  }
}
