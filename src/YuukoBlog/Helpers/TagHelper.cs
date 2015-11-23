using System;
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
            return string.Join(", ", Tags.Select(t=>t.Tag));
        }
    }
}
