// netlify/functions/idx-proxy.js
// This function will act as a serverless proxy to the IDX API

// Import 'node-fetch' if you're deploying to Netlify's build system
// For local testing with `netlify dev`, Node.js's native `fetch` might work,
// but explicit import is safer for deployment.
// If you encounter issues, ensure 'node-fetch' is in your package.json dependencies.
// const fetch = require('node-fetch'); // Uncomment this if 'fetch' is not globally available

exports.handler = async function(event, context) {
    // IMPORTANT: Replace with your actual IDX API credentials
    // These should match the ones in your index.html's IDX_CONFIG
    const IDX_CONFIG = {
        apiKey: 'awgq6dp2w63ixkbw4kjt377u8',
        accessToken: '7w14e1fzp5g5al7v9ky0dgx89',
        feedId: 'awgq6dp2w63ixkbw4kjt377u8',
        baseUrl: 'https://replication.sparkapi.com/v1/listings', // <--- Use the replication endpoint    };

    // Get search parameters from frontend query string
    const params = new URLSearchParams(event.queryStringParameters);

    // Add required API authentication parameters
    params.set('key', IDX_CONFIG.apiKey);
    params.set('token', IDX_CONFIG.accessToken);
    params.set('feed', IDX_CONFIG.feedId);
    params.set('status', 'active');
    params.set('limit', params.get('limit') || '12'); // Ensure limit is set if not passed

    // Build the full API request URL
    const fullApiUrl = `${IDX_CONFIG.baseUrl}?${params.toString()}`;

    try {
        // Make the request to the actual IDX API
        const response = await fetch(fullApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${IDX_CONFIG.accessToken}`,
                'X-API-Key': IDX_CONFIG.apiKey
            }
        });

        const data = await response.json(); // Parse the JSON response from the IDX API

        if (!response.ok) {
            // If the IDX API returns a non-200 status, return an error from the function
            console.error(`IDX API returned non-OK status: ${response.status}`, data);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `API returned HTTP ${response.status}`,
                    details: data, // Include API's error response for debugging
                    demo_mode: true, // Indicate that this response is an error from the proxy
                    message: 'Failed to fetch listings from IDX API.'
                })
            };
        }

        // Success! Return the IDX API response directly to your frontend
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        // Catch any network or parsing errors
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Proxy Error: ${error.message}`,
                demo_mode: true, // Indicate that this response is an error from the proxy
                message: 'A serverless function error occurred while fetching IDX data.'
            })
        };
    }
};
