// netlify/functions/idx-proxy.js
// This function acts as a serverless proxy to the IDX API.
// It is intended for deployment on Netlify to bypass browser CORS restrictions.
// This version is configured to use the FBS/Spark RESO Web API v3.

exports.handler = async function(event, context) {
    // These credentials are used for authenticating with the Spark API.
    // They should not be exposed in client-side JavaScript.
    const IDX_CONFIG = {
        apiKey: 'awgq6dp2w63ixkbw4kjt377u8',
        accessToken: '7w14e1fzp5g5al7v9ky0dgx89',
        feedId: 'awgq6dp2w63ixkbw4kjt377u8',
        // This is the confirmed RESO Web API v3 endpoint for fetching property data.
        baseUrl: 'https://replication.sparkapi.com/Version/3/Reso/OData/Property'
    };

    // Extract search parameters from the URL query string sent by the frontend.
    const params = new URLSearchParams(event.queryStringParameters);

    // Add required authentication and filter parameters to the API request.
    // The '$expand=Media' parameter is critical for fetching image URLs along with listings.
    params.set('key', IDX_CONFIG.apiKey);
    params.set('token', IDX_CONFIG.accessToken);
    params.set('feed', IDX_CONFIG.feedId);
    params.set('status', 'Active'); // RESO spec typically uses 'Active' (capitalized)
    params.set('limit', params.get('limit') || '12');
    params.set('$expand', 'Media');

    // Construct the full URL for the request to the external IDX API.
    const fullApiUrl = `${IDX_CONFIG.baseUrl}?${params.toString()}`;

    try {
        // Make the server-side request to bypass client-side CORS issues.
        const response = await fetch(fullApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${IDX_CONFIG.accessToken}`,
                'X-API-Key': IDX_CONFIG.apiKey,
                'User-Agent': 'Netlify Function IDX Proxy'
            }
        });

        // The response from the fetch call is processed.
        // It should return JSON data from the IDX API.
        const data = await response.json();

        if (!response.ok) {
            // Log and return a descriptive error if the API call failed.
            console.error(`IDX API returned non-OK status: ${response.status}`, data);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `API returned HTTP ${response.status}`,
                    details: data,
                    demo_mode: true,
                    message: `Failed to fetch listings from IDX API. Status: ${response.status}`
                })
            };
        }

        // If successful, return the data from the IDX API to the frontend.
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        // Handle network and other unexpected errors.
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
