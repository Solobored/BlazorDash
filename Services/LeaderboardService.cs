using BlazorDash.Data;
using Microsoft.EntityFrameworkCore;

namespace BlazorDash.Services;

/// <summary>
/// Service for managing high scores and leaderboard persistence.
/// </summary>
public class LeaderboardService
{
  private readonly GameDbContext _context;

  public LeaderboardService(GameDbContext context)
  {
    _context = context ?? throw new ArgumentNullException(nameof(context));
  }

  /// <summary>
  /// Adds a new high score to the database.
  /// </summary>
  public async Task AddHighScoreAsync(string playerName, int score)
  {
    var highScore = new HighScore
    {
      PlayerName = string.IsNullOrWhiteSpace(playerName) ? "Player" : playerName,
      Score = score,
      DateAchieved = DateTime.UtcNow
    };

    _context.HighScores.Add(highScore);
    await _context.SaveChangesAsync();
  }

  /// <summary>
  /// Gets the top 5 high scores, sorted by score descending.
  /// </summary>
  public async Task<List<HighScore>> GetTopScoresAsync(int count = 5)
  {
    return await _context.HighScores
        .OrderByDescending(x => x.Score)
        .Take(count)
        .ToListAsync();
  }

  /// <summary>
  /// Checks if the given score qualifies for the top 5.
  /// </summary>
  public async Task<bool> IsTopScoreAsync(int score)
  {
    var topScores = await GetTopScoresAsync(5);

    if (topScores.Count < 5)
      return true; // Always qualifies if we have fewer than 5 scores

    return score > topScores.Last().Score;
  }

  /// <summary>
  /// Clears all high scores (useful for testing or reset).
  /// </summary>
  public async Task ClearAllScoresAsync()
  {
    _context.HighScores.RemoveRange(_context.HighScores);
    await _context.SaveChangesAsync();
  }

  /// <summary>
  /// Gets the rank of a specific score (1 = best).
  /// Returns 0 if score wouldn't make top 10.
  /// </summary>
  public async Task<int> GetScoreRankAsync(int score)
  {
    var betterScores = await _context.HighScores
        .Where(x => x.Score > score)
        .CountAsync();

    return betterScores + 1;
  }

  /// <summary>
  /// Returns the highest score recorded or 0 if none exist.
  /// </summary>
  public async Task<int> GetBestScoreAsync()
  {
    return await _context.HighScores.AnyAsync()
        ? await _context.HighScores.MaxAsync(x => x.Score)
        : 0;
  }

  /// <summary>
  /// Returns the total number of recorded games.
  /// </summary>
  public Task<int> GetTotalGamesAsync()
  {
    return _context.HighScores.CountAsync();
  }
}
