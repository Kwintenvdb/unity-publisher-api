export interface RawReviewDataPage {
    reviews: any[];
    last_page: number;
    total_entries: number;
}

export interface ReviewData {
    body: string;
    subject: string;
    rating: number;
    packageId: number;
}

export function toReviewData(rawData: any): ReviewData {
    return {
        body: rawData.body,
        subject: rawData.subject,
        rating: Number(rawData.rating),
        packageId: Number(rawData.package_id),
    };
}
