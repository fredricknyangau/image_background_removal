// Service for calling the FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process image");
  }

  return await response.blob();
};
