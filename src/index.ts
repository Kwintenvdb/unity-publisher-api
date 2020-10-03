import got from 'got';
import { JSDOM } from 'jsdom';
import FormData from 'form-data';
import credentials from './credentials.json';
import tough from 'tough-cookie';

const CookieJar = tough.CookieJar;

const LOGIN_URL = 'https://id.unity.com/en/login';
const UNITY_SALES_URL = 'https://publisher.assetstore.unity3d.com/sales.html';
const PUBLISHER_OVERVIEW_JSON_URL = 'https://publisher.assetstore.unity3d.com/api/publisher/overview.json';

const jar = new CookieJar();
const http = got.extend({
    cookieJar: jar,
});

async function test() {
    /**
     * Phase 1: Retrieve authenticity token from the login page HTML.
     */
    const res = await http.get(LOGIN_URL);

    const dom = new JSDOM(res.body);
    const form: HTMLFormElement = dom.window.document.querySelector('#new_conversations_create_session_form');
    const action = form.action;

    const authenticityTokenInput: HTMLInputElement = form.querySelector('input[name="authenticity_token"]');
    const authenticityToken = authenticityTokenInput.value;

    /**
     * Phase 2: Log in using retrieved authenticity token and form data.
     */
    const formData = new FormData();
    formData.append('utf8', '✓');
    formData.append('_method', 'put');
    formData.append('authenticity_token', authenticityToken);
    formData.append('conversations_create_session_form[email]', credentials.email);
    formData.append('conversations_create_session_form[password]', credentials.password);
    formData.append('conversations_create_session_form[remember_me]', 'false');
    formData.append('commit', 'Sign in');

    console.log('Logging in with URL ' + 'https://id.unity.com' + action);

    await http.post('https://id.unity.com' + action, {
        body: formData,
        // This POST request will redirect to https://api.unity.com/v1/oauth2/authorize?cid=[authenticityToken]
        // It needs to send a GET request to this endpoint. If methodRewriting is TRUE, a POST request with the same
        // body will be sent to the endpoint instead.
        methodRewriting: false,
    });

    /**
     * Phase 3: Sucessfully logged in. Fetch sales page.
     * We are not yet authenticated for the sales page. It will redirect us to a page from which we need to follow yet another redirect.
     * This redirect URL is embedded in a <meta http-equiv="refresh"> element.
     * Following this URL will retrieve the kharma_session and kharma_token which are used to authenticate against the publisher API.
     */
    console.log('Logged in successfully. Retrieving session token...');

    const salesReq = await http.get(UNITY_SALES_URL);

    const dom2 = new JSDOM(salesReq.body);
    const meta: HTMLMetaElement = dom2.window.document.querySelector('meta[http-equiv="refresh"]');
    const redirectUrl = meta.content.split('url=').pop();

    const r3 = await http.get(redirectUrl);
    console.log(jar);

    const sales = await http.get(PUBLISHER_OVERVIEW_JSON_URL);
    console.log(sales.body);
}

test();
