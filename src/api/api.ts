import got, { RequestError } from 'got';
import tough from 'tough-cookie';
import { Authenticator } from './authenticator';
import { OverviewData } from './models/overviewData';
import { MonthData } from './models/monthData';
import { SalesData, toSalesData } from './models/salesData';
import { logError } from '../log';
import { PackageData, toPackageData } from './models/packageData';
import { RawReviewDataPage, ReviewData, toReviewData } from './models/reviewData';

const CookieJar = tough.CookieJar;

const PUBLISHER_OVERVIEW_JSON_URL = 'https://publisher.assetstore.unity3d.com/api/publisher/overview.json';
const PUBLISHER_INFO_BASE_URL = 'https://publisher.assetstore.unity3d.com/api/publisher-info';

const jar = new CookieJar();
const http = got.extend({
    cookieJar: jar,
    hooks: {
        beforeError: [
            (error: RequestError) => {
                if (error.response.statusCode === 401) {
                    logError('Encountered authorization error. Try calling UnityPublisherApi.authenticate() again.');
                }
                return error;
            },
        ],
    },
});

export class UnityPublisherApi {
    private readonly authenticator = new Authenticator(http);

    private publisherId: string = null;

    public async authenticate(email: string, password: string): Promise<void> {
        await this.authenticator.authenticate(email, password);
        await this.fetchPublisherId();
    }

    private async fetchPublisherId() {
        console.log('Fetching publisher id...');
        const overview = await this.getOverview();
        this.publisherId = overview.id;
    }

    public async getOverview(): Promise<OverviewData> {
        const data = await http.get(PUBLISHER_OVERVIEW_JSON_URL).json<{ overview: OverviewData }>();
        return data.overview;
    }

    public async getPackagesData(): Promise<PackageData[]> {
        const url = 'https://publisher.assetstore.unity3d.com/api/management/packages.json';
        const data = await http.get(url).json<{ packages: any[] }>();
        return data.packages.map(toPackageData);
    }

    public async getMonthsData(): Promise<MonthData[]> {
        const monthsUrl = this.getPublisherInfoUrl('months') + '.json';
        const data = await http.get(monthsUrl).json<{ periods: MonthData[] }>();
        return data.periods;
    }

    public async getSalesData(month: string): Promise<SalesData[]> {
        const salesUrl = `${this.getPublisherInfoUrl('sales')}/${month}.json`;
        const data = await http.get(salesUrl).json<{ aaData: Array<string[]> }>();
        return data.aaData.map(toSalesData);
    }

    // TODO add paging support
    public async getReviewData(): Promise<ReviewData[]> {
        const url = this.getPublisherInfoUrl('reviews') + '.json?page=1&rows=100&order_key=date&sort=desc';
        console.log(url);
        const data = await http.get(url)
            .json<RawReviewDataPage>()
            .catch(e => console.log(e));
        // @ts-ignore
        return data.reviews.map(toReviewData);
    }

    private getPublisherInfoUrl(type: 'months' | 'sales' | 'reviews'): string {
        if (!this.publisherId) {
            throw new Error('Publisher id not set.');
        }
        return `${PUBLISHER_INFO_BASE_URL}/${type}/${this.publisherId}`;
    }
}
