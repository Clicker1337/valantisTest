/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import md5 from 'md5';
const API_URL = 'https://api.valantis.store:41000/';
const PASSWORD = 'Valantis';

export const callAPI = async (action: string, params: any) => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const authString = md5(`${PASSWORD}_${timestamp}`);

    try {
        const response = await axios.post(
            API_URL,
            {
                action,
                params
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth': authString
                }
            }
        );
        return response.data.result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};