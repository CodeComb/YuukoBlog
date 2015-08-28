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
    public class TagController : BaseController
    {
        // GET: /<controller>/
        [Route("Tag/{tag}/{p:int?}")]
        public IActionResult Index(string tag, int p = 1)
        {
            return PagedTemplatedView<PostViewModel, Post>(DB.Posts
                 .Include(x => x.Tags)
                 .Include(x => x.Catalog)
                 .Where(x => !x.IsPage)
                 .Where(x => x.Tags.Any(y => y.Tag == tag))
                 .OrderByDescending(x => x.Time), 5, "~/Views/{template}/Index");
        }
    }
}
