export function storeTokenHandler(authTokenData){
    const accessToken = authTokenData.access_token;
    const refreshToken = authTokenData.refresh_token;
    const expiresIn = authTokenData.expiresIn;

    if (accessToken && accessToken.length > 2){
        sessionStorage.setItem('accessToken', accessToken);
    }

    if (refreshToken && refreshToken.length > 2){
        sessionStorage.setItem('refreshToken', refreshToken);
    }
    if (expiresIn && expiresIn > 0){
        const expirationTime = new Date().getTime() + authTokenData.expiresIn * 1000; // Expiration time in milliseconds
        sessionStorage.setItem('expirationTime', expirationTime.toString());
    }
}

export function getTokenHandler(type){
    return sessionStorage.getItem(type)
}

export function isTokenExpired() {
    const expirationTime = sessionStorage.getItem('expirationTime');
    // Parse the string back into a number
    if (expirationTime === null) return true;
    const expirationTimeNumber = parseInt(expirationTime, 10);
    return new Date().getTime() > expirationTimeNumber;
}


