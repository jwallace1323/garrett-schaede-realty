// location: netlify/functions/get-listings.js

exports.handler = async function(event, context) {
  const API_TOKEN = '7w14e1fzp5g5al7v9ky0dgx89';
  const { listingKey, page = 1, limit = 15, sort = 'RecentlyUpdated' } = event.queryStringParameters;

  // --- OData Sorting Options ---
  // Maps a simple name to the actual API field and direction.
  const sortOptions = {
    'RecentlyUpdated': 'ModificationTimestamp desc',
    'PriceLowHigh': 'ListPrice asc',
    'PriceHighLow': 'ListPrice desc'
  };
  const orderBy = sortOptions[sort] || sortOptions['RecentlyUpdated'];

  let apiUrl;

  if (listingKey) {
    // This part for fetching a single listing remains the same.
    apiUrl = `https://replication.sparkapi.com/Version/3/Reso/OData/Property?$filter=ListingKey eq '${listingKey}'&$expand=Media,Rooms`;
  } else {
    // --- UPDATED LOGIC FOR PAGINATION & SORTING ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    apiUrl = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property?' +
               `$filter=MlsStatus eq 'Active'` +
               `&$expand=Media` +
               `&$orderby=${orderBy}` +
               `&$top=${limit}` +
               `&$skip=${skip}` +
               `&$count=true`; // This is crucial: it asks the API for the total number of listings.
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: `API Error: ${response.statusText}` }) };
    }

    const data = await response.json();

    // The data object will now contain both the listings (`value`) and the total count (`@odata.count`).
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy server error: ' + error.message }) };
  }
};
