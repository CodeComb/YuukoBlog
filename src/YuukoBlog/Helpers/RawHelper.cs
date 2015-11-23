using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YuukoBlog.Models;

namespace Microsoft.AspNet.Mvc.Rendering
{
    public static class RawHelper
    {
        public static bool IsRaw(this IHtmlHelper self)
        {
            return self.ViewContext.HttpContext.Request.Query["raw"] == "true";
        }
    }
}
