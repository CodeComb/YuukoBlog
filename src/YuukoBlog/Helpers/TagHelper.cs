﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YuukoBlog.Models;

namespace Microsoft.AspNet.Mvc.Rendering
{
    public static class TagHelper
    {
        public static string TagSerialize(this IHtmlHelper self, IEnumerable<PostTag> Tags)
        {
            var ret = "";
            foreach (var t in Tags)
                ret += t.Tag + ", ";
            return ret.TrimEnd(' ').TrimEnd(',');
        }
    }
}
