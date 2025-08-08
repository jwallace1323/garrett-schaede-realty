// location: netlify/functions/get-listings.js

exports.handler = async function(event, context) {
  const API_TOKEN = '7w14e1fzp5g5al7v9ky0dgx89'; 
  const { listingKey, page = 1, limit = 15, sort = 'RecentlyUpdated' } = event.queryStringParameters;

  const sortOptions = {
    'RecentlyUpdated': 'ModificationTimestamp desc',
    'PriceLowHigh': 'ListPrice asc',
    'PriceHighLow': 'ListPrice desc'
  };
  const orderBy = sortOptions[sort] || sortOptions['RecentlyUpdated'];

  let apiUrl;

  if (listingKey) {
    // We will use the $filter method as it's more standard.
    console.log(`Fetching single listing with key: ${listingKey}`);
    apiUrl = `https://replication.sparkapi.com/Version/3/Reso/OData/Property?` +
               `$filter=ListingKey eq '${listingKey}'` +
               `&$expand=Media,Rooms`;
    console.log(`Constructed API URL for single listing: ${apiUrl}`);
  } else {
    // This logic for fetching all listings remains the same.
    const skip = (parseInt(page) - 1) * parseInt(limit);
    apiUrl = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property?' +
               `$filter=MlsStatus eq 'Active'` +
               `&$expand=Media` +
               `&$orderby=${orderBy}` +
               `&$top=${limit}` +
               `&$skip=${skip}` +
               `&$count=true`;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    // If the response is not OK, get the detailed error message.
    if (!response.ok) {
      const errorBody = await response.text(); // Get the raw error from the API
      console.error(`API Error Status: ${response.status}`);
      console.error(`API Error Body: ${errorBody}`);
      // Return a structured error to the front-end.
      return {
          statusCode: response.status,
          body: JSON.stringify({
              error: `API returned status ${response.status}`,
              details: errorBody 
          })
      };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    console.error('Proxy server error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy server error: ' + error.message }) };
  }
};
