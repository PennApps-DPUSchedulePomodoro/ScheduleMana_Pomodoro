import {storeTokenHandler, getTokenHandler} from "../../../utils/tokenHandling";
import makeRequest from "../../../utils/request"
const redirect_uri = '/auth/token';
const refresh_uri = '/auth/refreshToken';

async function getToken() {
    try {
        const response = await fetch(redirect_uri);
        const responseJson = await response.json();

        const authTokenData = responseJson.data.authTokenData
        storeTokenHandler(authTokenData)

    } catch (error) {
        throw new Error(error);
    }
}

// Refresh the access token every 15 minutes (900000ms)
async function refreshAccessToken() {
    const refreshToken = getTokenHandler('refreshToken');
    if (!refreshToken) {
        throw new Error("No refreshtoken found in storage")
    }
    try {
        const options = {
            url: refresh_uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        }

        const responseData = await makeRequest(options)
        // Check if the API call was successful
        if (!responseData.success) {
            // Log error details and possibly return or throw an error
            console.error('ErrorCode:', responseData.status, 'ErrorMessage:', responseData.error);
            return;
        }

        // Safely access nested data with optional chaining
        const authTokenData = responseData.data?.authTokenData;
        // Ensure authTokenData exists before proceeding
        if (!authTokenData) {
            console.error('No authTokenData available.');
            return; // Handle this case appropriately, maybe an error handling or a default state
        }

        console.log('AuthTokenData:', authTokenData);
        storeTokenHandler(authTokenData);
    } catch (error) {
        throw new Error('Failed to refresh access token' + error);
    }
}

module.exports = {getToken, refreshAccessToken}