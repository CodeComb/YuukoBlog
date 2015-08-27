using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Runtime;
using Microsoft.Data.Entity;
using Microsoft.AspNet.Hosting;
using CodeComb.vNext.Sample.YuukoBlog.Models;

namespace CodeComb.vNext.Sample.YuukoBlog
{
    public class Startup
    {
        public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
        {
            // Setup configuration sources.
            var builder = new ConfigurationBuilder(appEnv.ApplicationBasePath)
                .AddJsonFile("config.json")
                .AddJsonFile($"config.{env.EnvironmentName}.json", optional: true);
            
            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public static IConfiguration Configuration { get; set; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            var appEnv = services.BuildServiceProvider().GetRequiredService<IApplicationEnvironment>();
            
            services
                .AddEntityFramework()
                .AddSqlite()
                .AddDbContext<BlogContext>(options =>
                    options.UseSqlite("Data source=" + appEnv.ApplicationBasePath + "/" + Configuration["DBFile"] + ";"));

            services.AddCaching();
            services.AddSession();
            services.ConfigureSession(o =>
            {
                o.IdleTimeout = TimeSpan.FromMinutes(20);
            });

            services.AddTemplate(Configuration["DefaultTemplate"]);
        }

        public async void Configure(IApplicationBuilder app)
        {
            await SampleData.InitializeYuukoBlog(app.ApplicationServices);

            app.UseSession();
            
            app.UseMvc(router =>
            {
                router.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                router.MapRoute(
                    name: "page",
                    template: "{id}",
                    defaults: new { controller = "Page", action = "Index" });
            });
        }
    }
}
