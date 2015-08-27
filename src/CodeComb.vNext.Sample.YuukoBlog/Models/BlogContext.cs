using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Entity;

namespace CodeComb.vNext.Sample.YuukoBlog.Models
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
                e.Index(x => x.PRI);
            });

            modelBuilder.Entity<Post>(e =>
            {
                e.Index(x => x.IsPage);
                e.Index(x => x.Time);
                e.Index(x => x.Url).Unique();
            });

            modelBuilder.Entity<PostTag>(e =>
            {
                e.Index(x => x.Tag);
            });

            modelBuilder.Entity<Blob>(e =>
            {
                e.Index(x => x.Time);
                e.Index(x => x.ContentLength);
                e.Index(x => x.ContentType);
            });
        }
    }
}
