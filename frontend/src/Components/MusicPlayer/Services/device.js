// import {storeTokenHandler, getTokenHandler} from "../../../utils/tokenHandling";
import makeRequest from "../../../utils/request"
async function switchDevice(accessToken, deviceName) {
    //use makeRequest
    const options = {
        method: 'PUT',
        url: '/auth/switchDevice',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            deviceName: deviceName,
            play: true,
        }),
    }

    try {
        const response = await makeRequest(options);
        console.log(response)
        localStorage.setItem('deviceId', response.data.deviceId);
        return response.data;
    } catch (error) {
        console.error('Error switching device:', error);
        throw error;
    }
}

export default switchDevice;