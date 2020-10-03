import got from 'got';
import tough from 'tough-cookie';
import { Authenticator } from './authenticator';
import credentials from '../credentials.json';
import { OverviewData } from './models/overviewData';
import { MonthData } from './models/monthData';

const CookieJar = tough.CookieJar;

const PUBLISHER_OVERVIEW_JSON_URL = 'https://publisher.assetstore.unity3d.com/api/publisher/overview.json';
const PUBLISHER_INFO_BASE_URL = 'https://publisher.assetstore.unity3d.com/api/publisher-info';

const jar = new CookieJar();
const http = got.extend({
    cookieJar: jar,
});

export class UnityPublisherApi {
    private readonly authenticator = new Authenticator(http);

    private publisherId: string = null;

    public async authenticate(): Promise<void> {
        await this.authenticator.authenticate(credentials.email, credentials.password);
        await this.fetchPublisherId();
    }

    private async fetchPublisherId() {
        console.log('Fetching publisher id...');
        const overview = await this.getOverview();
        this.publisherId = overview.id;
        console.log(this.publisherId);
    }

    public async getOverview(): Promise<OverviewData> {
        const data = await http.get(PUBLISHER_OVERVIEW_JSON_URL).json<{ overview: OverviewData }>();
        return data.overview;
    }

    public async getMonthsData(): Promise<MonthData[]> {
        const monthsUrl = this.getPublisherInfoUrl('months') + '.json';
        const data = await http.get(monthsUrl).json<{ periods: MonthData[] }>();
        return data.periods;
    }

    public async getSalesData(month: string) {
        const salesUrl = `${this.getPublisherInfoUrl('sales')}/${month}.json`;
        const data = await http.get(salesUrl).json();
        console.log(data);
    }

    private getPublisherInfoUrl(type: 'months' | 'sales'): string {
        return `${PUBLISHER_INFO_BASE_URL}/${type}/${this.publisherId}`;
    }
}
