import axios from 'axios';

if (process.env.FASTREPORT_API_TOKEN == null) throw new Error(`FASTREPORT_API_TOKEN environment variable must be set`);

export const api = axios.create({
  baseURL: 'https://fastreport.cloud',
  headers: {
    Authorization: `Basic ${Buffer.from(`apikey:${process.env.FASTREPORT_API_TOKEN}`).toString('base64')}`,
  },
});

export { axios };
