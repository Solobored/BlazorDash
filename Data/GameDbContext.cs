using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BlazorDash.Data;

/// <summary>
/// Entity Framework Core database context for BlazorDash game data.
/// Manages HighScore persistence and user authentication.
/// </summary>
public class GameDbContext : IdentityDbContext<ApplicationUser>
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

                        entity.Property(e => e.UserId)
                    .IsRequired(false)
                    .HasMaxLength(128);

                        // Foreign key relationship - explicit configuration
                        entity.HasOne(e => e.User)
                    .WithMany(u => u.HighScores)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .IsRequired(false);
                });

                // Configure ApplicationUser
                modelBuilder.Entity<ApplicationUser>(entity =>
                {
                        entity.Property(e => e.DisplayName)
                    .HasMaxLength(100);

                        entity.Property(e => e.CreatedAt)
                    .IsRequired();
                });
        }
}
