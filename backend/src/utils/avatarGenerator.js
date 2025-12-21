/**
 * Generate UI Avatar URL for users without profile images
 * @param {string} name - User's full name
 * @param {Object} options - Avatar customization options
 * @returns {string} UI Avatar URL
 */
export const generateAvatarUrl = (name, options = {}) => {
  const {
    size = 200,
    background = '3398ff',
    color = 'fff',
    rounded = true,
    bold = true,
    length = null
  } = options;

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, length || 2);

  // Build URL parameters
  const params = new URLSearchParams({
    name: encodeURIComponent(name),
    background,
    color,
    size: size.toString(),
    rounded: rounded.toString(),
    bold: bold.toString()
  });

  if (length) {
    params.append('length', length.toString());
  }

  return `https://ui-avatars.com/api/?${params.toString()}`;
};

/**
 * Get avatar URL (either uploaded image or generated UI Avatar)
 * @param {Object} user - User object with name and image properties
 * @returns {Object} Avatar object with public_id and url
 */
export const getAvatarUrl = (user) => {
  if (user.image && user.image.url) {
    return user.image;
  }

  const name = user.name || 'User';
  return {
    public_id: null,
    url: generateAvatarUrl(name)
  };
};

/**
 * Generate different avatar styles for various use cases
 */
export const avatarStyles = {
  // Profile avatar (large, rounded)
  profile: (name) => generateAvatarUrl(name, {
    size: 200,
    background: '3398ff',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  // Thumbnail avatar (small, rounded)
  thumbnail: (name) => generateAvatarUrl(name, {
    size: 50,
    background: '3398ff',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  // List avatar (medium, rounded)
  list: (name) => generateAvatarUrl(name, {
    size: 100,
    background: '3398ff',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  // Square avatar (for grid layouts)
  square: (name) => generateAvatarUrl(name, {
    size: 150,
    background: '3398ff',
    color: 'fff',
    rounded: false,
    bold: true
  }),

  // Custom color schemes
  primary: (name) => generateAvatarUrl(name, {
    size: 200,
    background: '3398ff',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  secondary: (name) => generateAvatarUrl(name, {
    size: 200,
    background: '6C757D',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  success: (name) => generateAvatarUrl(name, {
    size: 200,
    background: '28A745',
    color: 'fff',
    rounded: true,
    bold: true
  }),

  warning: (name) => generateAvatarUrl(name, {
    size: 200,
    background: 'FFC107',
    color: '000',
    rounded: true,
    bold: true
  }),

  danger: (name) => generateAvatarUrl(name, {
    size: 200,
    background: 'DC3545',
    color: 'fff',
    rounded: true,
    bold: true
  })
}; 