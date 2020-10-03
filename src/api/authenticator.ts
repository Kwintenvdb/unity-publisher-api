import { Got, Response } from 'got';
import { JSDOM } from 'jsdom';
import FormData from 'form-data';
import credentials from '../credentials.json';
import { logSuccess } from '../log';

const LOGIN_URL = 'https://id.unity.com/en/login';
const UNITY_SALES_URL = 'https://publisher.assetstore.unity3d.com/sales.html';

export class Authenticator {
    constructor(private readonly httpClient: Got) {
    }

    public async authenticate(email: string, password: string): Promise<void> {
        /**
         * Phase 1: Retrieve authenticity token from the login page HTML.
         */
        const res = await this.httpClient.get(LOGIN_URL);
        const dom = new JSDOM(res.body);
        const form: HTMLFormElement = dom.window.document.querySelector('#new_conversations_create_session_form');
        const action = form.action;

        const authenticityTokenInput: HTMLInputElement = form.querySelector('input[name="authenticity_token"]');
        const authenticityToken = authenticityTokenInput.value;

        /**
         * Phase 2: Log in using retrieved authenticity token and form data.
         */
        console.log('Logging in...');
        await this.httpClient.post('https://id.unity.com' + action, {
            body: this.createLoginFormData(authenticityToken, email, password),
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
        logSuccess('Logged in successfully. Retrieving session token...');
        await this.retrieveSessionCookies();
        console.log('Session token retrieved.');
    }

    private createLoginFormData(authenticityToken: string, email: string, password: string): FormData {
        const formData = new FormData();
        formData.append('utf8', '✓');
        formData.append('_method', 'put');
        formData.append('authenticity_token', authenticityToken);
        formData.append('conversations_create_session_form[email]', credentials.email);
        formData.append('conversations_create_session_form[password]', credentials.password);
        formData.append('conversations_create_session_form[remember_me]', 'false');
        formData.append('commit', 'Sign in');
        return formData;
    }

    private async retrieveSessionCookies(): Promise<Response<string>> {
        const salesReq = await this.httpClient.get(UNITY_SALES_URL);
        const dom2 = new JSDOM(salesReq.body);
        const meta: HTMLMetaElement = dom2.window.document.querySelector('meta[http-equiv="refresh"]');
        const redirectUrl = meta.content.split('url=').pop();
        return this.httpClient.get(redirectUrl);
    }
}
