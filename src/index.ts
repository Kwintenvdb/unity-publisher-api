import { UnityPublisherApi } from './api/api';

async function initialize() {
    const api = new UnityPublisherApi();
    await api.authenticate();
    const months = await api.getMonthsData();
    const sales = await api.getSalesData(months[5].value);
    console.log(sales);
}

initialize();