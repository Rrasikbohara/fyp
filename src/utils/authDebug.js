/**
 * Auth debugging utility
 * Add this to components for detailed diagnosis of auth issues
 */

export const checkAuth = () => {
  console.log('============ AUTH DEBUGGING ============');
  
  // Check localStorage
  const token = localStorage.getItem('token');
  const userItem = localStorage.getItem('user');
  
  console.log('1. LocalStorage:');
  console.log('   - Token exists:', !!token);
  console.log('   - User exists:', !!userItem);
  
  // Parse JWT token if exists
  if (token) {
    try {
      // Decode JWT without library
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      
      console.log('2. JWT Token Analysis:');
      console.log('   - User ID:', decoded.id);
      console.log('   - Role:', decoded.role || 'none');
      console.log('   - Expires:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('   - Is expired:', decoded.exp * 1000 < Date.now());
      console.log('   - Issued at:', new Date(decoded.iat * 1000).toLocaleString());
    } catch (e) {
      console.log('   - Error decoding token:', e.message);
    }
  }
  
  // Parse user object if exists
  if (userItem) {
    try {
      const user = JSON.parse(userItem);
      console.log('3. User Object:');
      console.log('   - ID:', user.id);
      console.log('   - Name:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Role:', user.role || 'none');
    } catch (e) {
      console.log('   - Error parsing user object:', e.message);
    }
  }
  
  console.log('========================================');
};

// Export a function to fix common issues
export const repairAuth = () => {
  const token = localStorage.getItem('token');
  const userItem = localStorage.getItem('user');
  
  console.log('Attempting to repair authentication state...');
  
  // No token - can't repair
  if (!token) {
    console.log('No token found, cannot repair');
    return false;
  }
  
  try {
    // Decode token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // Token is expired - can't repair
    if (decoded.exp * 1000 < Date.now()) {
      console.log('Token is expired, cannot repair');
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    // Token is valid but user object is missing or invalid
    if (!userItem || !JSON.parse(userItem)) {
      console.log('Creating user object from token');
      const newUser = {
        id: decoded.id,
        name: decoded.name || 'User',
        role: decoded.role || 'user'
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log('Auth repair completed');
      return true;
    }
    
    // Both token and user exist
    console.log('Auth state looks valid, no repair needed');
    return true;
  } catch (e) {
    console.error('Failed to repair auth state:', e);
    return false;
  }
};

// Add a force login function that can be used in case of emergencies
export const forceLogin = (redirectTo = '/dashboard') => {
  const token = localStorage.getItem('token');
  const userItem = localStorage.getItem('user');
  
  if (!token) {
    console.error('No token found, cannot force login');
    return false;
  }
  
  if (!userItem) {
    console.error('No user data found, cannot force login');
    return false;
  }
  
  try {
    // Check if token is valid
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // Token is expired
    if (decoded.exp * 1000 < Date.now()) {
      console.error('Token is expired, cannot force login');
      return false;
    }
    
    // Clear cookies and reload to dashboard
    console.log('Force login initiated, redirecting to:', redirectTo);
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 500);
    
    return true;
  } catch (e) {
    console.error('Failed to force login:', e);
    return false;
  }
};

// Add function to check login loop
export const checkLoginLoop = () => {
  const loopKey = 'login_loop_count';
  const currentCount = parseInt(localStorage.getItem(loopKey) || '0');
  
  if (currentCount > 3) {
    console.error('Possible login loop detected!');
    
    // Clear the loop counter
    localStorage.setItem(loopKey, '0');
    
    // Try to repair auth
    const repaired = repairAuth();
    if (!repaired) {
      // If repair failed, try clearing auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Auth state cleared, redirecting to login');
    }
    
    return true;
  }
  
  // Increment counter
  localStorage.setItem(loopKey, (currentCount + 1).toString());
  
  // Set timeout to reset counter
  setTimeout(() => {
    localStorage.setItem(loopKey, '0');
  }, 5000);
  
  return false;
};

/**
 * Auth debugger utility
 * Used to diagnose authentication issues
 */

export function debugAuthState() {
  console.group('Auth State Debug');
  
  // Check for tokens
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  const userData = localStorage.getItem('userData');
  const adminData = localStorage.getItem('adminData');
  
  console.log('User token exists:', !!userToken);
  console.log('Admin token exists:', !!adminToken);
  console.log('User data exists:', !!userData);
  console.log('Admin data exists:', !!adminData);
  
  // Decode and inspect tokens if they exist
  if (userToken) {
    try {
      const decoded = decodeToken(userToken);
      console.group('User Token');
      console.log('User ID:', decoded.id);
      console.log('Role:', decoded.role);
      console.log('Expiry:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Is expired:', Date.now() > decoded.exp * 1000);
      console.groupEnd();
    } catch (e) {
      console.error('Error decoding user token:', e);
    }
  }
  
  if (adminToken) {
    try {
      const decoded = decodeToken(adminToken);
      console.group('Admin Token');
      console.log('Admin ID:', decoded.id);
      console.log('Role:', decoded.role);
      console.log('Expiry:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Is expired:', Date.now() > decoded.exp * 1000);
      console.groupEnd();
    } catch (e) {
      console.error('Error decoding admin token:', e);
    }
  }
  
  console.groupEnd();
  
  return {
    hasUserToken: !!userToken,
    hasAdminToken: !!adminToken,
    hasUserData: !!userData,
    hasAdminData: !!adminData,
    userData: userData ? JSON.parse(userData) : null,
    adminData: adminData ? JSON.parse(adminData) : null
  };
}

function decodeToken(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  return JSON.parse(jsonPayload);
}

export function fixAuthState() {
  // Clear all auth data to start fresh
  localStorage.removeItem('token'); // Remove old token key
  localStorage.removeItem('user'); // Remove old user key
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  
  console.log('Auth state has been reset. Please log in again.');
  return true;
}

// Add this utility function to check token conflicts
export function checkTokenConflict() {
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  
  if (userToken && adminToken) {
    try {
      const userDecoded = decodeToken(userToken);
      const adminDecoded = decodeToken(adminToken);
      
      // Check if both tokens have different roles but same ID
      if (userDecoded.id === adminDecoded.id && userDecoded.role !== adminDecoded.role) {
        console.warn('Potential token conflict detected: Same ID with different roles');
        return true;
      }
    } catch (e) {
      console.error('Error checking token conflict:', e);
    }
  }
  
  return false;
}

export default { checkAuth, repairAuth, forceLogin, checkLoginLoop, debugAuthState, fixAuthState, checkTokenConflict };
