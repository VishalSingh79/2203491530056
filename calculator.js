// Calculator Application

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4NTAwMTMyLCJpYXQiOjE3NDg0OTk4MzIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImI3YWY3NzE3LTUxMzktNGJhMi1hYmZjLTc5ZGYzNGE2MGYxYSIsInN1YiI6InNpbmdodmlzaGFsNjg2MDMwQGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNpbmdodmlzaGFsNjg2MDMwQGdtYWlsLmNvbSIsIm5hbWUiOiJ2aXNoYWwgc2luZ2giLCJyb2xsTm8iOiIyMjAzNDkxNTMwMDU2IiwiYWNjZXNzQ29kZSI6Im5ybXZCTiIsImNsaWVudElEIjoiYjdhZjc3MTctNTEzOS00YmEyLWFiZmMtNzlkZjM0YTYwZjFhIiwiY2xpZW50U2VjcmV0IjoiSHRmVEpaYmdWVVpZRHNrZCJ9.KwTHL9OsE-xMYkdJF6zo6kL1cJgIuPAZFxeTgBYOX_M';

let slidingWindow = [];

const getApiEndpoint = (type) => {
    const endpoints = {
        p: '/primes',
        f: '/fibo',
        e: '/even',
        r: '/rand'
    };
    return endpoints[type] ? `${API_BASE_URL}${endpoints[type]}` : null;
};

const getNumbersFromApi = async (type) => {
    const endpoint = getApiEndpoint(type);
    if (!endpoint) return null;

    try {
        const { data, status } = await axios.get(endpoint, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`
            }
        });

        return status === 200 ? data.numbers : null;
    } catch (err) {
        console.error('Error fetching from API:', err.message);
        return null;
    }
};


app.get('/numbers/:type', async (req, res) => {
    const type = req.params.type;
    const previousWindow = [...slidingWindow];

    const newNumbers = await getNumbersFromApi(type);

    if (newNumbers && Array.isArray(newNumbers)) {
        for (const num of newNumbers) {
            if (!slidingWindow.includes(num)) {
                if (slidingWindow.length < WINDOW_SIZE) {
                    slidingWindow.push(num);
                } else {
                    slidingWindow.shift();
                    slidingWindow.push(num);
                }
            }
        }
    }

    const currentWindow = [...slidingWindow];
    const average = slidingWindow.length > 0
        ? parseFloat((slidingWindow.reduce((sum, val) => sum + val, 0) / slidingWindow.length).toFixed(2))
        : 0;

    res.json({
        windowPrevState: previousWindow,
        windowCurrState: currentWindow,
        numbers: newNumbers || [],
        avg: average
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
