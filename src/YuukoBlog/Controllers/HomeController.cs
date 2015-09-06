using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using YuukoBlog.Models;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace YuukoBlog.Controllers
{
    public class HomeController : BaseController
    {
        // GET: /<controller>/
        [Route("{p:int?}")]
        public IActionResult Index(int p = 1)
        {
            return PagedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Catalog)
                .Include(x => x.Tags)
                .Where(x => !x.IsPage)
                .OrderByDescending(x => x.Time), 5, "Home");
        }

        [Route("{year:int}/{month:int}/{p:int?}")]
        public IActionResult Calendar(int year, int month, int p = 1)
        {
            var begin = new DateTime(year, month, 1);
            var end = begin.AddMonths(1);
            return PagedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Tags)
                .Include(x => x.Catalog)
                .Where(x => !x.IsPage)
                .Where(x => x.Time >= begin && x.Time <= end)
                .OrderByDescending(x => x.Time), 5, "Home");
        }

        [Route("Catalog/{id}")]
        public IActionResult Catalog(string id)
        {
            var catalog = DB.Catalogs
                .Where(x => x.Url == id)
                .SingleOrDefault();
            if (catalog == null)
                return Error(404);
            ViewBag.Position = catalog.Url;
            return PagedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Tags)
                .Include(x => x.Catalog)
                .Where(x => !x.IsPage && x.CatalogId == catalog.Id)
                .OrderByDescending(x => x.Time), 5, "Home");
        }

        [Route("Tag/{tag}/{p:int?}")]
        public IActionResult Tag(string tag, int p = 1)
        {
            return PagedView<PostViewModel, Post>(DB.Posts
                 .Include(x => x.Tags)
                 .Include(x => x.Catalog)
                 .Where(x => !x.IsPage)
                 .Where(x => x.Tags.Any(y => y.Tag == tag))
                 .OrderByDescending(x => x.Time), 5, "Home");
        }

        [Route("Search/{id}/{p:int?}")]
        public IActionResult Search(string id, int p = 1)
        {
            return PagedView<PostViewModel, Post>(DB.Posts
                    .Include(x => x.Tags)
                    .Include(x => x.Catalog)
                    .Where(x => !x.IsPage)
                    .Where(x => x.Title.Contains(id) || id.Contains(x.Title))
                    .OrderByDescending(x => x.Time), 5, "Home");
        }

        public new IActionResult Template(string Folder)
        {
            Cookies["_template"] = Folder;
            return Redirect(Request.Headers.Get("Referer") ?? "/");
        }
    }
}
