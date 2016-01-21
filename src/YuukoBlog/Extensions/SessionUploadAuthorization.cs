namespace YuukoBlog.Extensions
{
    using Microsoft.AspNet.Http;
    using Microsoft.AspNet.Http.Features;
    using CodeComb.AspNet.Upload;

    public class SessionUploadAuthorization : IUploadAuthorizationProvider
    {
        private ISession Session;
        public SessionUploadAuthorization(IHttpContextAccessor accessor)
        {
            Session = accessor.HttpContext.Session;
        }

        public bool IsAbleToUpload()
        {
            var val = Session.GetString("Admin");
            if (val == "true")
                return true;
            return false;
        }
    }
}

namespace Microsoft.Extensions.DependencyInjection
{
    using CodeComb.AspNet.Upload;
    using YuukoBlog.Extensions;

    public static class SignedUserUploadAuthorizationProviderServiceCollectionExtensions
    {
        public static IFileUploadBuilder AddSessionUploadAuthorization(this IFileUploadBuilder self)
        {
            self.Services.AddSingleton<IUploadAuthorizationProvider, SessionUploadAuthorization>();
            return self;
        }
    }
}