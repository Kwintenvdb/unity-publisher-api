export interface SalesData {
    packageName: string;
    price: string;
    sales: number;
    gross: string;
}

export function toSalesData(rawData: string[]): SalesData {
    return {
        packageName: rawData[0],
        price: rawData[1],
        sales: Number(rawData[2]),
        gross: rawData[5],
    };
}
