// location: netlify/functions/get-listings.js

exports.handler = async function(event, context) {
  const API_TOKEN = '7w14e1fzp5g5al7v9ky0dgx89'; 
  const { listingKey } = event.queryStringParameters; // Check for a specific listingKey

  let apiUrl;

  if (listingKey) {
    // SCENARIO 1: Fetch a SINGLE listing for the details page
    // We expand Media and Rooms to get all photos and room details.
    apiUrl = `https://replication.sparkapi.com/Version/3/Reso/OData/Property?$filter=ListingKey eq '${listingKey}'&$expand=Media,Rooms`;
  } else {
    // SCENARIO 2: Fetch ALL active listings for the main properties page
    apiUrl = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property?$expand=Media&$filter=MlsStatus eq \'Active\'';
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${response.statusText}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy server error: ' + error.message })
    };
  }
};
