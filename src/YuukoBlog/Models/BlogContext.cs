using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Entity;
using CodeComb.AspNet.Upload.Models;

namespace YuukoBlog.Models
{
    public class BlogContext : DbContext, IFileUploadDbContext
    {
        public DbSet<Post> Posts { get; set; }

        public DbSet<PostTag> PostTags { get; set; }

        public DbSet<Catalog> Catalogs { get; set; }

        public DbSet<File> Files { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.SetupBlob();

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
        }
    }
}
