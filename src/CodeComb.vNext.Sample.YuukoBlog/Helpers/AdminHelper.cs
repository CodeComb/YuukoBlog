using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Http;

namespace Microsoft.AspNet.Mvc.Rendering
{
    public static class AdminHelper
    {
        public static bool IsAdmin(this IHtmlHelper self)
        {
            if (self.ViewContext.HttpContext.Session.GetString("Admin") == "true")
                return true;
            else
                return false;
        }
    }
}
