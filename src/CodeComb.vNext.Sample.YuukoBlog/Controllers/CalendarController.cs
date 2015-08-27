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
    public class CalendarController : BaseController
    {
        // GET: /<controller>/
        [Route("{year:int}/{month:int}/{page:int?}")]
        public IActionResult Index(int year, int month, int? p)
        {
            var begin = new DateTime(year, month,1);
            var end = begin.AddMonths(1);
            return PagedTemplatedView<PostViewModel, Post>(DB.Posts
                .Include(x => x.Tags)
                .Include(x => x.Catalog)
                .Where(x => !x.IsPage)
                .Where(x => x.Time >= begin && x.Time <= end)
                .OrderByDescending(x => x.Time), 5, "~/Views/{template}/Index");
        }
    }
}
