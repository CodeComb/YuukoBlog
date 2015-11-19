using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Filters;
using Microsoft.AspNet.Http;
using Microsoft.Extensions.Internal;

namespace YuukoBlog.Filters
{
    public class GuestRequiredAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.HttpContext.Session.GetString("Admin") == "true")
                context.Result = new RedirectResult("/Admin/Index");
            else
                base.OnActionExecuting(context);
        }

        public override Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.HttpContext.Session.GetString("Admin") == "true")
                context.Result = new RedirectResult("/Admin/Index");
            return base.OnActionExecutionAsync(context, next);
        }
    }
}
