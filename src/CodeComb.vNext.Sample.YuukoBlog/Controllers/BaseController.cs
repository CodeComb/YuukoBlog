using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using CodeComb.vNext.Sample.YuukoBlog.Models;

namespace CodeComb.vNext.Sample.YuukoBlog.Controllers
{
    public class BaseController : BaseController<BlogContext>
    {
        protected override void Prepare()
        {
            base.Prepare();

            // Building Constants
            ViewBag.Position = "home";
            ViewBag.IsPost = false;
            ViewBag.Description = Startup.Configuration["Description"];
            ViewBag.Title = Startup.Configuration["Site"];
            ViewBag.Site = Startup.Configuration["Site"];
            ViewBag.AboutUrl = Startup.Configuration["AboutUrl"];
            ViewBag.AvatarUrl = Startup.Configuration["AvatarUrl"];
            ViewBag.Disqus = Startup.Configuration["Disqus"];
            ViewBag.Account = Startup.Configuration["Account"];

            // Building Tags
            ViewBag.Tags = DB.PostTags
                .OrderBy(x => x.Tag)
                .GroupBy(x => x.Tag)
                .Select(x => new TagViewModel
                {
                    Title = x.Key,
                    Count = x.Count()
                })
                .ToList();

            // Building Calendar
            ViewBag.Calendars = DB.Posts
                .Where(x => !x.IsPage)
                .OrderByDescending(x => x.Time)
                .GroupBy(x => new { Year = x.Time.Year, Month = x.Time.Month })
                .Select(x => new CalendarViewModel
                {
                    Year = x.Key.Year,
                    Month = x.Key.Month,
                    Count = x.Count()
                })
                .ToList();

            // Building Catalogs
            // Issue: 由于EF7 beta6不允许在查询过程中Join，因此这里写的有点略SB
            ViewBag.Catalogs = DB.Catalogs
                .Include(x => x.Posts)
                .OrderByDescending(x => x.PRI)
                .ToList()
                .Select(x => new CatalogViewModel
                {
                    Id = x.Id,
                    Title = x.Title,
                    Count = x.Posts.Count(),
                    PRI = x.PRI,
                    Url = x.Url
                })
                .ToList();
        }
    }
}
