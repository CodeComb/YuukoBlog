﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CodeComb.vNext.Sample.YuukoBlog.Models
{
    public class PostViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public DateTime Time { get; set; }
        public string Summary { get; set; }
        public List<PostTag> Tags { get; set; }
        public Catalog Catalog { get; set; }
        public Guid? CatalogId { get; set; }
        public string Url { get; set; }
    }
}
