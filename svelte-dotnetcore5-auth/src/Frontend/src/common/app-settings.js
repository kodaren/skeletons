export const oidcClientId = "SvelteStore"
export const devConfig = {
    CLIENT_ID: 'SvelteStore',
    API_URL:  'https://localhost:44300',
    AUTHORITY_URL: 'https://localhost:44300'
}

const isProd = __myapp && __myapp.isProd;
const prodConfig = {
    CLIENT_ID:  __myapp.CLIENT_ID,
    API_URL: __myapp.API_URL,
    AUTHORITY_URL: __myapp.AUTHORITY_URL,
}
export const appSettings = isProd ? prodConfig : devConfig;

