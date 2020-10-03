import { UnityPublisherApi } from './api';

async function initialize() {
    const api = new UnityPublisherApi();
    await api.authenticate();
}

initialize();