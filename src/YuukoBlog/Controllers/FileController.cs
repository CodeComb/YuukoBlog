using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Http.Extensions;
using YuukoBlog.Models;

namespace YuukoBlog.Controllers
{
    public class FileController : BaseController
    {
        [HttpPost]
        public IActionResult Upload(IFormFile file)
        {
            if (HttpContext.Session.GetString("Admin") != "true")
                return Json(new
                {
                    code = 403,
                    msg = "Forbidden"
                });

            if(file == null)
                return Json(new
                {
                    code = 400,
                    msg = "File not found"
                });

            var _file = new Blob();
            _file.FileName = file.GetFileName();
            _file.Time = DateTime.Now;
            _file.Id = Guid.NewGuid();
            _file.ContentLength = file.Length;
            _file.ContentType = file.ContentType;
            _file.File = file.ReadAllBytes();
            DB.Blobs.Add(_file);
            DB.SaveChanges();
            return Json(new
            {
                code = 200,
                fileId = _file.Id.ToString()
            });
        }

        [HttpPost]
        public IActionResult Base64String(string file)
        {
            if (HttpContext.Session.GetString("Admin") != "true")
                return Json(new
                {
                    code = 403,
                    msg = "Forbidden"
                });

            if (file == null)
                return Json(new
                {
                    code = 400,
                    msg = "File not found"
                });
            var img = new Base64StringImage(file);
            var _file = new Blob();
            _file.FileName = "file";
            _file.Time = DateTime.Now;
            _file.Id = Guid.NewGuid();
            _file.ContentType = img.ContentType;
            _file.File = img.AllBytes;
            _file.ContentLength = _file.File.Length;
            DB.Blobs.Add(_file);
            DB.SaveChanges();
            return Json(new
            {
                code = 200,
                fileId = _file.Id.ToString()
            });
        }

        [HttpGet]
        public IActionResult Download(Guid id)
        {
            var file = DB.Blobs
                .Where(x => x.Id == id)
                .SingleOrDefault();
            if (file == null)
                return Prompt(new Prompt
                {
                    StatusCode = 404,
                    Title = SR["Not Found"],
                    Details = SR["The resources have not been found, please check your request."],
                    RedirectUrl = Url.Link("default", new { controller = "Home", action = "Index" }),
                    RedirectText = SR["Back to home"]
                }); return File(file.File, file.ContentType, file.FileName);
        }
    }
}
