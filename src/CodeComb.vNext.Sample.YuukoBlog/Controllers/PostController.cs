﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace CodeComb.vNext.Sample.YuukoBlog.Controllers
{
    public class PostController : BaseController
    {
        [Route("Post/{id}")]
        public IActionResult Index(string id)
        {
            var post = DB.Posts
                .Include(x => x.Catalog)
                .Include(x => x.Tags)
                .Where(x => x.Url == id && !x.IsPage)
                .SingleOrDefault();
            if (post == null)
                return TemplatedError(404);
            ViewBag.Title = post.Title;
            ViewBag.Position = post.CatalogId != null ? post.Catalog.Url : "home";
            return TemplatedView("~/Views/{template}/Post", post);
        }
    }
}
