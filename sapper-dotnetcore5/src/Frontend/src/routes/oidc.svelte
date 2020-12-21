<script>
import axios, { AxiosInstance } from 'axios';

import { readable } from 'svelte/store';

export const oidc_config = readable(null, set => {
    //set(new Date());

    const axiosInstance = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        })        
    });

    axiosInstance.get("https://localhost:44300/_configuration/SvelteStore")
        .then((res) => {
            return res.data;
        })
        .then(data => {
            set(data);
            console.table(data);
        });
        //return () => clearInterval(interval);
});

let config;
oidc_config.subscribe(value => {
    config = value;
})

</script>

{#if config}
    <h2 >{config.authority}</h2>
{/if}
<!-- 
{#await configPromise}
    Loading config
{:then value}
    <pre>{JSON.stringify(value)}</pre>
{:catch error}
    <h2>{error}</h2>
{/await} -->
