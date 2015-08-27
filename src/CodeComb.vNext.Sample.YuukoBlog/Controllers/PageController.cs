using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace CodeComb.vNext.Sample.YuukoBlog.Controllers
{
    public class PageController : BaseController
    {
        // GET: /<controller>/
        [Route("{id}")]
        public IActionResult Index(string id)
        {
            var post = DB.Posts
                .Where(x => x.Url == id && x.IsPage)
                .SingleOrDefault();
            if (post == null)
                return TemplatedError(404);
            ViewBag.Title = post.Title;
            ViewBag.Position = post.CatalogId.HasValue ? post.Catalog.Url : "home";
            return TemplatedView(post);
        }
    }
}
