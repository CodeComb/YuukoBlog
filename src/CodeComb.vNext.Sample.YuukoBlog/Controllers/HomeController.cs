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
    public class HomeController : BaseController
    {
        // GET: /<controller>/
        public IActionResult Index(int p = 1)
        {
            return PagedTemplatedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Catalog)
                .Include(x => x.Tags)
                .Where(x => !x.IsPage)
                .OrderByDescending(x => x.Time)
                .ToList(), 5, "~/Views/{template}/Index");
        }
    }
}
