using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace YuukoBlog.Models
{
    public class Blob
    {
        public Guid Id { get; set; }

        [MaxLength(128)]
        public string FileName { get; set; }

        [MaxLength(128)]
        public string ContentType { get; set; }

        public long ContentLength { get; set; }

        public DateTime Time { get; set; }

        public byte[] File { get; set; }
    }
}
