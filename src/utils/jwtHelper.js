/**
 * Simple JWT decoder function when jwt-decode library has import issues
 * @param {string} token - JWT token to decode
 * @returns {object} - Decoded JWT payload
 */
export function decodeJwt(token) {
  if (!token) {
    throw new Error('Invalid token');
  }
  
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Get the payload part (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw error;
  }
}
