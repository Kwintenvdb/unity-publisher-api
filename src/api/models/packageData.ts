export interface PackageData {
    id: string;
    name: string;
    url: string;
    averageRating: number;
    numRatings: number;
    price: number;
    version: string;
}

export function toPackageData(rawData: any): PackageData {
    return {
        id: rawData.id,
        name: rawData.name,
        url: rawData.short_url,
        averageRating: rawData.average_rating,
        numRatings: rawData.count_ratings,
        price: rawData.versions[0].price,
        version: rawData.versions[0].version_name,
    };
}
