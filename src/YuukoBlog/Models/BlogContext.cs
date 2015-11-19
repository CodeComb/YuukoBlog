using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Entity;

namespace YuukoBlog.Models
{
    public class BlogContext : DbContext
    {
        public DbSet<Post> Posts { get; set; }

        public DbSet<PostTag> PostTags { get; set; }

        public DbSet<Catalog> Catalogs { get; set; }

        public DbSet<Blob> Blobs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Catalog>(e =>
            {
                e.HasIndex(x => x.PRI);
            });

            modelBuilder.Entity<Post>(e =>
            {
                e.HasIndex(x => x.IsPage);
                e.HasIndex(x => x.Time);
                e.HasIndex(x => x.Url).IsUnique();
            });

            modelBuilder.Entity<PostTag>(e =>
            {
                e.HasIndex(x => x.Tag);
            });

            modelBuilder.Entity<Blob>(e =>
            {
                e.HasIndex(x => x.Time);
                e.HasIndex(x => x.ContentLength);
                e.HasIndex(x => x.ContentType);
            });
        }
    }
}
