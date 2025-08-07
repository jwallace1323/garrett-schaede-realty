// This is your server-side proxy. It runs on Netlify, not in the browser.

exports.handler = async function(event, context) {
  // --- CONFIGURATION ---
  // Your new access token is placed here.
  // For a real production site, store this as an Environment Variable in your Netlify dashboard.
  const API_TOKEN = '7w14e1fzp5g5al7v9ky0dgx89'; 
  const API_ENDPOINT = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property?$expand=Media&$filter=MlsStatus eq \'Active\'';

  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        // The Authorization header is now sent securely from the server.
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // If the API call fails, pass along the error status.
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch from Spark API: ${response.statusText}` })
      };
    }

    const data = await response.json();

    // Success! Return the listing data to your website.
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    // Handle any network errors during the fetch from the server.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy server error: ' + error.message })
    };
  }
};
