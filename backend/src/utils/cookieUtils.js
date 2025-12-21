/**
 * Set JWT token in HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} options - Cookie options
 */
export const setTokenCookie = (res, token, options = {}) => {
  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
    path = '/'
  } = options;

  res.cookie('token', token, {
    httpOnly,
    secure,
    sameSite,
    maxAge,
    path
  });
};

/**
 * Clear JWT token cookie
 * @param {Object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * Get token from cookies or Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token
 */
export const getTokenFromRequest = (req) => {
  // First try to get from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Fallback to Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

/**
 * Cookie configuration for different environments
 */
export const cookieConfig = {
  development: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  },
  production: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  }
}; 