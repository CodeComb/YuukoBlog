using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using CodeComb.vNext.Sample.YuukoBlog.Models;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace CodeComb.vNext.Sample.YuukoBlog.Controllers
{
    public class CatalogController : BaseController
    {
        // GET: /<controller>/
        [Route("Catalog/{id}")]
        public IActionResult Index(string id)
        {
            var catalog = DB.Catalogs
                .Where(x => x.Url == id)
                .SingleOrDefault();
            if (catalog == null)
                return TemplatedError(404);
            ViewBag.Position = catalog.Url;
            return PagedTemplatedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Tags)
                .Include(x => x.Catalog)
                .Where(x => !x.IsPage && x.CatalogId == catalog.Id)
                .OrderByDescending(x => x.Time), 5, "~/Views/{template}/Index");
        }
    }
}
