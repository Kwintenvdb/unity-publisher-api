import currency from 'currency.js';

export interface SalesData {
    packageName: string;
    price: number;
    sales: number;
    gross: number;
    lastSale: string;
}

export function toSalesData(rawData: string[]): SalesData {
    return {
        packageName: rawData[0],
        price: currency(rawData[1]).value,
        sales: parseInt(rawData[2]) || 0,
        gross: currency(rawData[5]).value,
        lastSale: rawData[7],
    };
}
