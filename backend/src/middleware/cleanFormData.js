// Middleware to clean form data (remove quotes from values)
export const cleanFormData = (req, res, next) => {
  if (req.body) {
    // Clean all string values in req.body
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove surrounding quotes (both single and double)
        req.body[key] = req.body[key].replace(/^["']|["']$/g, '');
      }
    });
  }
  next();
};

