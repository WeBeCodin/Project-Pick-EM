/**
 * Get the effective user ID for API calls
 * Handles Clerk user objects and fallbacks
 */
export const getEffectiveUserId = (user: any): string => {
  // Clerk user object has 'id' property
  if (user?.id) {
    return user.id;
  }
  
  // Fallback to emailAddress if available (for Clerk users)
  if (user?.emailAddresses?.[0]?.emailAddress) {
    // Create a persistent ID from email for consistency
    return createPersistentUserId(user.emailAddresses[0].emailAddress);
  }
  
  // Try username if available
  if (user?.username) {
    return user.username;
  }
  
  // Legacy fallback for localStorage (deprecated with Clerk)
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        return parsedUser.id || parsedUser.username || 'demo-user';
      }
    } catch (error) {
      console.warn('Failed to parse saved user from localStorage:', error);
    }
  }
  
  // Default fallback
  return 'demo-user';
};

/**
 * Create a persistent user ID from email (similar to session-store.ts)
 */
const createPersistentUserId = (email: string): string => {
  // Simple hash function for browser compatibility
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `clerk_${Math.abs(hash).toString(16)}`;
};

/**
 * Get the effective username for API calls and display
 */
export const getEffectiveUsername = (user: any): string => {
  // Try username first
  if (user?.username) {
    return user.username;
  }
  
  // Try firstName + lastName
  if (user?.firstName || user?.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  
  // Try email before @ symbol
  if (user?.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.split('@')[0];
  }
  
  // Fallback
  return 'User';
};

/**
 * Get the effective email for API calls
 */
export const getEffectiveEmail = (user: any): string => {
  if (user?.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress;
  }
  
  return '';
};

/**
 * Make a league API call with automatic user detection
 */
export const fetchUserLeagues = async (user: any, action: string = 'my-leagues') => {
  const userId = getEffectiveUserId(user);
  const response = await fetch(`/api/leagues?action=${action}&userId=${userId}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
