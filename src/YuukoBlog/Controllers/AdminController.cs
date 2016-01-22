﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Http;
using Microsoft.Data.Entity;
using YuukoBlog.Filters;
using YuukoBlog.Models;

namespace YuukoBlog.Controllers
{
    public class AdminController : BaseController
    {
        [AdminRequired]
        [HttpGet]
        [Route("Admin/Index")]
        public IActionResult Index() 
        {
            return View();
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Index")]
        public IActionResult Index(Config config, string OldPwd)
        {
            Configuration["Account"] = config.Account;
            Configuration["Password"] = config.Password;
            Configuration["Site"] = config.Site;
            Configuration["Description"] = config.Description;
            Configuration["Disqus"] = config.Disqus;
            Configuration["AvatarUrl"] = config.AvatarUrl;
            Configuration["AboutUrl"] = config.AboutUrl;
            return RedirectToAction("Index", "Admin");
        }

        [GuestRequired]
        public IActionResult Login()
        {
            return View();
        }

        [GuestRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(string Username, string Password)
        {
            var tmp = Configuration["Account"];
            if (Username == Configuration["Account"] && Password == Configuration["Password"])
            {
                HttpContext.Session.SetString("Admin", "true");
                return RedirectToAction("Index", "Admin");
            }
            else
            {
                return View();
            }
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Post/Edit")]
        public IActionResult PostEdit(string id, string newId, string content, string tags, bool isPage, string title, Guid? catalog)
        {
            var post = DB.Posts
                .Include(x => x.Tags)
                .Where(x => x.Url == id)
                .SingleOrDefault();
            if (post == null)
                return Prompt(new Prompt
                {
                    StatusCode = 404,
                    Title = SR["Not Found"],
                    Details = SR["The resources have not been found, please check your request."],
                    RedirectUrl = Url.Link("default", new { controller = "Home", action = "Index" }),
                    RedirectText = SR["Back to home"]
                });
            var summary = "";
            var flag = false;
            var tmp = content.Split('\n');
            if (tmp.Count() > 16)
            {
                for (var i = 0; i < 16; i++)
                {
                    if (tmp[i].IndexOf("```") == 0)
                        flag = !flag;
                    summary += tmp[i] + '\n';
                }
                if (flag)
                    summary += "```\r\n";
                summary += $"\r\n[{SR["Read More"]} »](/post/{newId})";
            }
            else
            {
                summary = content;
            }
            foreach (var t in post.Tags)
                DB.PostTags.Remove(t);
            post.Url = newId;
            post.Summary = summary;
            post.Title = title;
            post.Content = content;
            post.CatalogId = catalog;
            post.IsPage = isPage;
            if (!string.IsNullOrEmpty(tags))
            { 
                var _tags = tags.Split(',');
                foreach (var t in _tags)
                    post.Tags.Add(new PostTag { PostId = post.Id, Tag = t.Trim(' ') });
            }
            DB.SaveChanges();
            return Content(Marked.Parse(content));
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Post/Delete")]
        public IActionResult PostDelete(string id)
        {
            var post = DB.Posts
                .Include(x => x.Tags)
                .Where(x => x.Url == id).SingleOrDefault();
            
            if (post == null)
                return Prompt(new Prompt
                {
                    StatusCode = 404,
                    Title = SR["Not Found"],
                    Details = SR["The resources have not been found, please check your request."],
                    RedirectUrl = Url.Link("default", new { controller = "Home", action = "Index" }),
                    RedirectText = SR["Back to home"]
                });
            foreach (var t in post.Tags)
                DB.PostTags.Remove(t);
            DB.Posts.Remove(post);
            DB.SaveChanges();
            return RedirectToAction("Index", "Home");
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Post/New")]
        public IActionResult PostNew()
        {
            var post = new Post
            {
                Id = Guid.NewGuid(),
                Url = Guid.NewGuid().ToString().Substring(0, 8),
                Title = SR["Untitled Post"],
                Content = "",
                Summary = "",
                CatalogId = null,
                IsPage = false,
                Time = DateTime.Now
            };
            DB.Posts.Add(post);
            DB.SaveChanges();
            return RedirectToAction("Post", "Post", new { id = post.Url });
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }

        [AdminRequired]
        public IActionResult Catalog()
        {
            return View(DB.Catalogs.OrderByDescending(x => x.PRI).ToList());
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Catalog/Delete")]
        public IActionResult CatalogDelete(string id)
        {
            var catalog = DB.Catalogs.Where(x => x.Url == id).SingleOrDefault();
            if (catalog == null)
                return Prompt(new Prompt
                {
                    StatusCode = 404,
                    Title = SR["Not Found"],
                    Details = SR["The resources have not been found, please check your request."],
                    RedirectUrl = Url.Link("default", new { controller = "Home", action = "Index" }),
                    RedirectText = SR["Back to home"]
                });
            DB.Catalogs.Remove(catalog);
            DB.SaveChanges();
            return Content("true");
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Catalog/Edit")]
        public IActionResult CatalogEdit(string id, string newId, string title, int pri)
        {
            var catalog = DB.Catalogs.Where(x => x.Url == id).SingleOrDefault();
            if (catalog == null)
                return Prompt(new Prompt
                {
                    StatusCode = 404,
                    Title = SR["Not Found"],
                    Details = SR["The resources have not been found, please check your request."],
                    RedirectUrl = Url.Link("default", new { controller = "Home", action = "Index" }),
                    RedirectText = SR["Back to home"]
                }); catalog.Url = newId;
            catalog.Title = title;
            catalog.PRI = pri;
            DB.SaveChanges();
            return Content("true");
        }

        [AdminRequired]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Admin/Catalog/New")]
        public IActionResult CatalogNew()
        {
            var catalog = new Catalog
            {
                Url = Guid.NewGuid().ToString().Substring(0, 8),
                PRI = 0,
                Title = SR["New Catalog"]
            };
            DB.Catalogs.Add(catalog);
            DB.SaveChanges();
            return RedirectToAction("Catalog", "Admin");
        }
    }
}
