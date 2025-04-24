/**
 * Auth debugger utility
 * Used to diagnose and fix authentication issues
 */

// Storage keys
const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';

export function debugAuthState() {
  console.group('Auth State Debug');
  
  // Check for tokens
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const userData = localStorage.getItem(USER_DATA_KEY);
  const adminData = localStorage.getItem(ADMIN_DATA_KEY);
  
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
      console.log('Name:', decoded.name);
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
      console.log('Username:', decoded.username);
      console.log('Expiry:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Is expired:', Date.now() > decoded.exp * 1000);
      console.groupEnd();
    } catch (e) {
      console.error('Error decoding admin token:', e);
    }
  }
  
  // Check for any conflicts
  const conflicts = checkAuthConflicts();
  if (conflicts.length > 0) {
    console.warn('Auth conflicts detected:', conflicts);
    console.log('Use fixAuthConflicts() to resolve these issues');
  } else {
    console.log('No auth conflicts detected');
  }
  
  console.groupEnd();
  
  return {
    hasUserToken: !!userToken,
    hasAdminToken: !!adminToken,
    hasUserData: !!userData,
    hasAdminData: !!adminData,
    userData: userData ? JSON.parse(userData) : null,
    adminData: adminData ? JSON.parse(adminData) : null,
    conflicts
  };
}

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Token decode error:', e);
    return {};
  }
}

function checkAuthConflicts() {
  const conflicts = [];
  
  // Get all tokens and data
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const userData = localStorage.getItem(USER_DATA_KEY);
  const adminData = localStorage.getItem(ADMIN_DATA_KEY);
  
  // Check for mismatched data (token exists but data doesn't)
  if (userToken && !userData) {
    conflicts.push('User token exists but user data is missing');
  }
  
  if (adminToken && !adminData) {
    conflicts.push('Admin token exists but admin data is missing');
  }
  
  // Check for expired tokens
  if (userToken) {
    try {
      const decoded = decodeToken(userToken);
      if (Date.now() > decoded.exp * 1000) {
        conflicts.push('User token is expired');
      }
    } catch (e) {
      conflicts.push('User token is invalid');
    }
  }
  
  if (adminToken) {
    try {
      const decoded = decodeToken(adminToken);
      if (Date.now() > decoded.exp * 1000) {
        conflicts.push('Admin token is expired');
      }
    } catch (e) {
      conflicts.push('Admin token is invalid');
    }
  }
  
  return conflicts;
}

export function fixAuthConflicts() {
  const conflicts = checkAuthConflicts();
  
  if (conflicts.length === 0) {
    console.log('No auth conflicts to fix');
    return false;
  }
  
  console.log('Fixing auth conflicts:', conflicts);
  
  // Fix user token/data issues
  if (conflicts.includes('User token exists but user data is missing') ||
      conflicts.includes('User token is expired') ||
      conflicts.includes('User token is invalid')) {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    console.log('Cleared user authentication data');
  }
  
  // Fix admin token/data issues
  if (conflicts.includes('Admin token exists but admin data is missing') ||
      conflicts.includes('Admin token is expired') ||
      conflicts.includes('Admin token is invalid')) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
    console.log('Cleared admin authentication data');
  }
  
  return true;
}

export function clearUserAuth() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  console.log('User authentication data cleared');
  return true;
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
  console.log('Admin authentication data cleared');
  return true;
}

export function clearAllAuth() {
  clearUserAuth();
  clearAdminAuth();
  console.log('All authentication data cleared');
  return true;
}

// Add this function to handle legacy/inconsistent auth storage keys
export function cleanupLegacyAuth() {
  // List of keys that should not be used anymore
  const legacyKeys = ['user', 'userToken'];
  
  // Check and remove legacy keys
  legacyKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing legacy auth key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Check for inconsistent state (having one but not both required keys)
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if ((token && !userData) || (!token && userData)) {
    console.log('Inconsistent auth state detected, clearing all auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    return true;
  }
  
  return false;
}
