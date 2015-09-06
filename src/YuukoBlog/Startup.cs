using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Framework.Logging;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Dnx.Runtime;
using Microsoft.Data.Entity;
using Microsoft.AspNet.Hosting;
using YuukoBlog.Models;

namespace YuukoBlog
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
            var appEnv = services.BuildServiceProvider().GetRequiredService<IApplicationEnvironment>();

            var connStr = "Data source=" + appEnv.ApplicationBasePath + "/" + Configuration["DBFile"] + ";";
            if (connStr.IndexOf('\\') >= 0)
                connStr = connStr.Replace("/", "\\");

            Console.WriteLine(connStr);

            services
                .AddEntityFramework()
                .AddSqlite()
                .AddDbContext<BlogContext>(options =>
                    options.UseSqlite(connStr));

            services.AddCaching();
            services.AddSession();
            services.ConfigureSession(o =>
            {
                o.IdleTimeout = TimeSpan.FromMinutes(20);
            });
            services.AddMvc().AddTemplate(Configuration["DefaultTemplate"]);
        }

        public async void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.MinimumLevel = LogLevel.Information;
            loggerFactory.AddConsole();
            loggerFactory.AddDebug();

            app.UseStaticFiles();
            app.UseSession();
            
            app.UseMvc(router =>
            {
                router.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });

            await SampleData.InitializeYuukoBlog(app.ApplicationServices);
        }
    }
}
