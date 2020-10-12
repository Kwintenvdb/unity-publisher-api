export interface RawReviewDataPage {
    reviews: any[];
    last_page: number;
    total_entries: number;
}

export interface ReviewData {
    id: number;
    body: string;
    subject: string;
    rating: number;
    package: string;
    packageId: number;
    date: string;
}

export function toReviewData(rawData: any): ReviewData {
    return {
        id: Number(rawData.review_id),
        body: rawData.body,
        subject: rawData.subject,
        rating: Number(rawData.rating),
        package: rawData.name,
        packageId: Number(rawData.package_id),
        date: rawData.created_at,
    };
}
