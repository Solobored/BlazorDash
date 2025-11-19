namespace BlazorDash.Services;

/// <summary>
/// Represents a rectangle for collision detection (AABB).
/// </summary>
public struct Rect
{
  public float X { get; set; }
  public float Y { get; set; }
  public float Width { get; set; }
  public float Height { get; set; }

  public Rect(float x, float y, float width, float height)
  {
    X = x;
    Y = y;
    Width = width;
    Height = height;
  }

  /// <summary>
  /// Axis-aligned bounding box collision detection.
  /// </summary>
  public bool Intersects(Rect other)
  {
    return X < other.X + other.Width &&
           X + Width > other.X &&
           Y < other.Y + other.Height &&
           Y + Height > other.Y;
  }

  public override string ToString() => $"Rect({X:F1}, {Y:F1}, {Width:F1}x{Height:F1})";
}

/// <summary>
/// Represents a single obstacle in the game world.
/// </summary>
public class Obstacle
{
  public float X { get; set; }
  public float Y { get; set; }
  public float Width { get; set; }
  public float Height { get; set; }
  public float VelocityX { get; set; }

  /// <summary>
  /// Returns a Rect for collision detection.
  /// </summary>
  public Rect GetBounds() => new(X, Y, Width, Height);
}

/// <summary>
/// Complete game state snapshot.
/// </summary>
public class GameState
{
  public float PlayerX { get; set; }
  public float PlayerY { get; set; }
  public float PlayerVelocityY { get; set; }
  public float PlayerWidth { get; set; } = 40;
  public float PlayerHeight { get; set; } = 40;

  public List<Obstacle> Obstacles { get; set; } = [];

  public int Score { get; set; }
  public bool IsGameOver { get; set; }
  public float ElapsedSeconds { get; set; }

  /// <summary>
  /// Returns a Rect for the player's collision bounds.
  /// </summary>
  public Rect GetPlayerBounds() => new(PlayerX, PlayerY, PlayerWidth, PlayerHeight);

  public override string ToString() =>
      $"GameState(Player: {PlayerX:F1},{PlayerY:F1} Vy:{PlayerVelocityY:F1}, Score: {Score}, Obstacles: {Obstacles.Count}, GameOver: {IsGameOver})";
}
