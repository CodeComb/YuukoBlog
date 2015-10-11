using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace YuukoBlog.Models
{
    public static class SampleData
    {
        public static async Task InitializeYuukoBlog(IServiceProvider serviceProvider)
        {
            try
            {
                using (var db = serviceProvider.GetService<BlogContext>())
                {
                    var sqlServerDatabase = db.Database;
                    if (sqlServerDatabase != null)
                    {
                        if (await sqlServerDatabase.EnsureCreatedAsync())
                        {
                            //
                        }
                    }
                    else
                    {
                        //
                    }
                }
            }
            catch
            {
            }
        }
    }
}
