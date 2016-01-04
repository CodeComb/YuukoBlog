using Microsoft.AspNet.Hosting;

namespace YuukoBlog
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var application = new WebApplicationBuilder()
                .UseConfiguration(WebApplicationConfiguration.GetDefault(args))
                .UseStartup("YuukoBlog")
                .Build();

            application.Run();
        }
    }
}
