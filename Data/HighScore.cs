namespace BlazorDash.Data;

/// <summary>
/// Represents a high score entry in the leaderboard.
/// </summary>
public class HighScore
{
  public int Id { get; set; }

  /// <summary>
  /// Player name (default "Player" if not provided).
  /// </summary>
  public string PlayerName { get; set; } = "Player";

  /// <summary>
  /// Score value (higher is better).
  /// </summary>
  public int Score { get; set; }

  /// <summary>
  /// Date and time when the score was achieved.
  /// </summary>
  public DateTime DateAchieved { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// Foreign key to the user who achieved this score (nullable for anonymous scores).
  /// </summary>
  public string? UserId { get; set; }

  /// <summary>
  /// Navigation property to the user.
  /// </summary>
  public ApplicationUser? User { get; set; }
}
