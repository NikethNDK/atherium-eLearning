export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/${imagePath}`;
  };

