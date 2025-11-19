using Microsoft.EntityFrameworkCore;

namespace BlazorDash.Data;

/// <summary>
/// Entity Framework Core database context for BlazorDash game data.
/// Manages HighScore persistence.
/// </summary>
public class GameDbContext : DbContext
{
  public DbSet<HighScore> HighScores { get; set; }

  public GameDbContext(DbContextOptions<GameDbContext> options) : base(options)
  {
  }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // Configure HighScore table
    modelBuilder.Entity<HighScore>(entity =>
    {
      entity.HasKey(e => e.Id);
      entity.Property(e => e.PlayerName)
              .IsRequired()
              .HasMaxLength(100);
      entity.Property(e => e.Score)
              .IsRequired();
      entity.Property(e => e.DateAchieved)
              .IsRequired();
    });
  }
}
