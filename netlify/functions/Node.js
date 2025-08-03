// netlify/functions/idx-proxy.js
// This function will act as a serverless proxy to the IDX API

exports.handler = async function(event, context) {
    const IDX_CONFIG = {
        apiKey: 'awgq6dp2w63ixkbw4kjt377u8',
        accessToken: '7w14e1fzp5g5al7v9ky0dgx89',
        feedId: 'awgq6dp2w63ixkbw4kjt377u8',
        baseUrl: 'https://replication.sparkapi.com/v1/listings', // Ensure this is the latest correct URL
    };

    const params = new URLSearchParams(event.queryStringParameters);

    params.set('key', IDX_CONFIG.apiKey);
    params.set('token', IDX_CONFIG.accessToken);
    params.set('feed', IDX_CONFIG.feedId);
    params.set('status', 'active');
    params.set('limit', params.get('limit') || '12');

    const fullApiUrl = `${IDX_CONFIG.baseUrl}?${params.toString()}`;

    try {
        const response = await fetch(fullApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${IDX_CONFIG.accessToken}`,
                'X-API-Key': IDX_CONFIG.apiKey
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`IDX API returned non-OK status: ${response.status}`, data);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `API returned HTTP ${response.status}`,
                    details: data,
                    demo_mode: true,
                    message: 'Failed to fetch listings from IDX API.'
                })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Proxy Error: ${error.message}`,
                demo_mode: true,
                message: 'A serverless function error occurred while fetching IDX data.'
            })
        };
    }
};
