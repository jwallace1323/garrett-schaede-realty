<?php
// idx-proxy.php - Server-side proxy for IDX API calls
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// IDX Configuration
$IDX_CONFIG = [
    'apiKey' => 'awgq6dp2w63ixkbw4kjt377u8',
    'accessToken' => '7w14e1fzp5g5al7v9ky0dgx89',
    'feedId' => 'awgq6dp2w63ixkbw4kjt377u8',
    'baseUrl' => 'https://api.idxhome.com/v1/search'
];

// Get search parameters from frontend
$params = [
    'key' => $IDX_CONFIG['apiKey'],
    'token' => $IDX_CONFIG['accessToken'],
    'feed' => $IDX_CONFIG['feedId'],
    'limit' => $_GET['limit'] ?? '12',
    'status' => 'active'
];

// Add optional filters
if (!empty($_GET['minprice'])) $params['minprice'] = $_GET['minprice'];
if (!empty($_GET['maxprice'])) $params['maxprice'] = $_GET['maxprice'];
if (!empty($_GET['beds'])) $params['beds'] = $_GET['beds'];
if (!empty($_GET['baths'])) $params['baths'] = $_GET['baths'];
if (!empty($_GET['propertytype'])) $params['propertytype'] = $_GET['propertytype'];
if (!empty($_GET['city'])) $params['city'] = $_GET['city'];

// Build query string
$queryString = http_build_query($params);
$url = $IDX_CONFIG['baseUrl'] . '?' . $queryString;

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $IDX_CONFIG['accessToken'],
    'X-API-Key: ' . $IDX_CONFIG['apiKey']
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle response
if ($error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'CURL Error: ' . $error,
        'demo_mode' => true
    ]);
} elseif ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'API returned HTTP ' . $httpCode,
        'response' => $response,
        'demo_mode' => true
    ]);
} else {
    // Success - return the API response
    echo $response;
}
?>