using IdentityServer4.Models;
using IdentityServer4.Validation;
using System.Linq;
using System.Threading.Tasks;

namespace SvelteStore.Infrastructure.Services
{
    public class CustomRedirectUriValidator : StrictRedirectUriValidator
    {
        public override async Task<bool> IsPostLogoutRedirectUriValidAsync(string requestedUri, Client client)
        {
            if (await base.IsPostLogoutRedirectUriValidAsync(requestedUri, client))
            {
                return true;
            }
            var result = client.PostLogoutRedirectUris.Any(uri => requestedUri.StartsWith(uri));
            return result;
        }

        public override async Task<bool> IsRedirectUriValidAsync(string requestedUri, Client client)
        {
            if (await base.IsRedirectUriValidAsync(requestedUri, client))
            {
                return true;
            }

            var result = client.RedirectUris.Any(uri => requestedUri.StartsWith(uri));
            return result;
        }
    }
}
