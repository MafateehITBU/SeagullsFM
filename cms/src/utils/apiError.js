/**
 * Pull a user-facing message out of an Axios/API error.
 */
export function getApiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  const data = error?.response?.data;

  if (!data) {
    if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
      return "Cannot reach the server. Check that the API is running.";
    }
    return error?.message || fallback;
  }

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  const parts = [];

  if (typeof data.message === "string" && data.message.trim()) {
    parts.push(data.message.trim());
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const validationMessages = data.errors
      .map((item) => item?.message || item?.msg)
      .filter(Boolean);
    if (validationMessages.length > 0) {
      parts.push(...validationMessages);
    }
  }

  if (typeof data.error === "string" && data.error.trim()) {
    parts.push(data.error.trim());
  }

  if (
    data.currentDimensions?.width != null &&
    data.currentDimensions?.height != null
  ) {
    parts.push(
      `Current size: ${data.currentDimensions.width}x${data.currentDimensions.height}.`
    );
  }

  if (Array.isArray(data.recommendedSizes) && data.recommendedSizes.length > 0) {
    parts.push(`Recommended sizes: ${data.recommendedSizes.join(", ")}.`);
  }

  if (Array.isArray(data.recommendedFavIconSizes) && data.recommendedFavIconSizes.length > 0) {
    parts.push(`Recommended sizes: ${data.recommendedFavIconSizes.join(", ")}.`);
  }

  const unique = [...new Set(parts.filter(Boolean))];
  return unique.length > 0 ? unique.join(" ") : fallback;
}
