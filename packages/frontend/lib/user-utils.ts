/**
 * Get the effective user ID for API calls
 * Handles cases where user context might not be available
 */
export const getEffectiveUserId = (user: any): string => {
  // If we have a user object with an ID, use it
  if (user?.id) {
    return user.id;
  }
  
  // If we have a user object with username, use it
  if (user?.username) {
    return user.username;
  }
  
  // Try to get user from localStorage as fallback
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
