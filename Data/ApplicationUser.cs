using Microsoft.AspNetCore.Identity;

namespace BlazorDash.Data;

/// <summary>
/// Extended user model for BlazorDash with additional profile information.
/// </summary>
public class ApplicationUser : IdentityUser
{
  /// <summary>
  /// User's display name (used on leaderboard if not set, defaults to UserName).
  /// </summary>
  public string? DisplayName { get; set; }

  /// <summary>
  /// Account creation timestamp.
  /// </summary>
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// User's high scores.
  /// </summary>
  public ICollection<HighScore> HighScores { get; set; } = new List<HighScore>();
}
