import got from 'got';
import tough from 'tough-cookie';
import { Authenticator } from './authenticator';

const CookieJar = tough.CookieJar;

const PUBLISHER_OVERVIEW_JSON_URL = 'https://publisher.assetstore.unity3d.com/api/publisher/overview.json';

const jar = new CookieJar();
const http = got.extend({
    cookieJar: jar,
});

export class UnityPublisherApi {
    private readonly authenticator = new Authenticator(http);

    public async authenticate(): Promise<void> {
        await this.authenticator.authenticate();
        console.log('Fetching overview...');
        await this.getOverview();
    }

    public async getOverview() {
        const overview = await http.get(PUBLISHER_OVERVIEW_JSON_URL).json();
        console.log(overview);
    }
}
