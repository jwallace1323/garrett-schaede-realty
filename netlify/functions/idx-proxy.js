// netlify/functions/idx-proxy.js
// This function will act as a serverless proxy to the IDX API.
// It is intended to be deployed on Netlify to bypass browser CORS restrictions.

// Node.js 18+ has native fetch. If you are using an older runtime on Netlify,
// you might need to install 'node-fetch' as a dependency.
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // IMPORTANT: Your actual IDX API credentials from the FBS/MLS dashboard.
    // These values are embedded here for the serverless function to use.
    // They should not be exposed in the client-side JavaScript.
    const IDX_CONFIG = {
        apiKey: 'awgq6dp2w63ixkbw4kjt377u8',
        accessToken: '7w14e1fzp5g5al7v9ky0dgx89',
        feedId: 'awgq6dp2w63ixkbw4kjt377u8',
        // The confirmed base URL for Spark API's replication endpoint.
        baseUrl: 'https://replication.sparkapi.com/v1/listings'
    };

    // Extract search parameters from the URL query string sent by the frontend.
    const params = new URLSearchParams(event.queryStringParameters);

    // Add the required authentication and filter parameters to the API request.
    // These parameters are added on the server side to keep them secure.
    params.set('key', IDX_CONFIG.apiKey);
    params.set('token', IDX_CONFIG.accessToken);
    params.set('feed', IDX_CONFIG.feedId);
    params.set('status', 'active');
    // Set a default limit if one is not provided by the client, for efficiency.
    params.set('limit', params.get('limit') || '12');

    // Construct the full URL for the request to the external IDX API.
    const fullApiUrl = `${IDX_CONFIG.baseUrl}?${params.toString()}`;

    try {
        // Use Node.js's native fetch to make the authenticated request.
        // This server-side call bypasses client-side CORS issues.
        const response = await fetch(fullApiUrl, {
            method: 'GET',
            headers: {
                // The headers are added here, on the server, as per API requirements.
                'Accept': 'application/json',
                'Authorization': `Bearer ${IDX_CONFIG.accessToken}`,
                'X-API-Key': IDX_CONFIG.apiKey,
                // Include the User-Agent as recommended by the documentation.
                'User-Agent': 'Netlify Function IDX Proxy'
            }
        });

        const data = await response.json(); // Parse the JSON response from the IDX API.

        if (!response.ok) {
            // If the API returns a non-200 status code, log the error and return a formatted error response.
            console.error(`IDX API returned non-OK status: ${response.status}`, data);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `API returned HTTP ${response.status}`,
                    details: data,
                    demo_mode: true, // This flag can be used by the frontend to trigger the demo mode display.
                    message: `Failed to fetch listings from IDX API. Status: ${response.status}`
                })
            };
        }

        // If the request was successful, return the raw data from the IDX API to the frontend.
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        // Catch and handle any network or parsing errors that occur during the fetch.
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
