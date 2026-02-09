// Middleware to clean form data (remove quotes from values)
export const cleanFormData = (req, res, next) => {
  if (req.body) {
    // Clean all string values in req.body
    Object.keys(req.body).forEach((key) => {
      // Handle arrays (form-data arrays come as arrays from multer)
      if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => {
          if (typeof item === 'string') {
            return item.replace(/^["']|["']$/g, '');
          }
          return item;
        });
      } else if (typeof req.body[key] === 'string') {
        // Remove surrounding quotes (both single and double)
        req.body[key] = req.body[key].replace(/^["']|["']$/g, '');
        
        // Special handling for array fields (days, permissions, deletedImages) - try to parse as JSON array
        if (key === 'days' || key === 'permissions' || key === 'deletedImages') {
          try {
            // Try to parse as JSON array
            const parsed = JSON.parse(req.body[key]);
            if (Array.isArray(parsed)) {
              req.body[key] = parsed;
            }
          } catch {
            // If not valid JSON, check if it looks like an array string
            // Handle format like: "['Sunday', 'Monday']" or '["Sunday", "Monday"]'
            const arrayMatch = req.body[key].match(/\[(.*?)\]/);
            if (arrayMatch) {
              try {
                // Try to parse the inner content
                const innerContent = arrayMatch[1];
                // Split by comma and clean each item
                const items = innerContent.split(',').map(item => {
                  return item.trim().replace(/^["']|["']$/g, '').replace(/^['"]|['"]$/g, '');
                });
                req.body[key] = items.filter(item => item.length > 0);
              } catch {
                // If parsing fails, keep as is
              }
            }
          }
        }
      }
    });
  }
  next();
};

