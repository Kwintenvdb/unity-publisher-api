export interface PackageData {
    id: string;
    name: string;
    url: string;
}

export function toPackageData(rawData: any): PackageData {
    return {
        id: rawData.id,
        name: rawData.name,
        url: rawData.short_url,
    };
}
