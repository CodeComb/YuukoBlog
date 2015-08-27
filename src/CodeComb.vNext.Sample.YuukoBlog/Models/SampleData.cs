﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Entity.Sqlite;
using Microsoft.Framework.DependencyInjection;

namespace CodeComb.vNext.Sample.YuukoBlog.Models
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
            catch (Exception ex)
            {
            }
        }
    }
}
