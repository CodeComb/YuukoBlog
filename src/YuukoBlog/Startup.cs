using System;
using Microsoft.AspNet.Builder;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.Data.Entity;
using YuukoBlog.Models;

namespace YuukoBlog
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            IConfiguration Configuration;
            services.AddConfiguration(out Configuration);
            var appEnv = services.BuildServiceProvider().GetRequiredService<IApplicationEnvironment>();
            var connStr = "Data source=" + appEnv.ApplicationBasePath + "/" + Configuration["DBFile"] + ";";
            if (connStr.IndexOf('\\') >= 0)
                connStr = connStr.Replace("/", "\\");

            services.AddSmartCookies();

            services.AddJsonLocalization()
                .AddCookieCulture();

            services.AddEntityFramework()
                .AddSqlite()
                .AddDbContext<BlogContext>(options =>
                    options.UseSqlite(connStr));

            services.AddCaching();
            services.AddSession(x => x.IdleTimeout = TimeSpan.FromMinutes(20));

            services.AddFileUpload()
                .AddEntityFrameworkStorage<BlogContext>()
                .AddSessionUploadAuthorization();

            services.AddMvc()
                .AddTemplate()
                .AddCookieTemplateProvider();
        }

        public async void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory)
        {
            loggerFactory.MinimumLevel = LogLevel.Information;
            loggerFactory.AddConsole();
            loggerFactory.AddDebug();

            app.UseStaticFiles();
            app.UseSession();
            app.UseFileUpload("/assets/shared/scripts/jquery.codecomb.fileupload.js");

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
