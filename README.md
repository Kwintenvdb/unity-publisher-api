# Unity Publisher API

A small Node.js library to fetch data from the Unity Publisher API. This data is normally only available through the [Unity Publisher Administration](https://publisher.assetstore.unity3d.com/) page.

Note that this will only run on Node.js, not in the browser.

## Usage

The following example authenticates the user, fetches all month data, and then fetches the sales of the first available month.

```ts
const api = new UnityPublisherApi();
await api.authenticate(my_email, my_password);
const months = await api.getMonthsData();
const sales = await api.getSalesData(months[0].value); // You can fetch sales data per month
```

The api instance stores the authentication cookies after the first authentication, and they are used for each subsequent request. The cookies will expire after some time, after which you will need to call `authenticate` again.
